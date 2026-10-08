//! Modern vanilla demo launch. Authenticated play is deliberately not implemented.
use crate::{
    download::{Artifact, Downloader},
    instance::Instance,
    java::{self, JavaRuntime},
    metadata::{allowed, Argument, ArgumentValue, AssetIndex, Platform, Version},
    paths::within,
};
use anyhow::{ensure, Context, Result};
use serde::Serialize;
use std::{
    collections::BTreeMap,
    fs::{self, File},
    path::PathBuf,
    process::{Command, Stdio},
};

pub struct PreparedGame {
    pub classpath: Vec<PathBuf>,
    pub assets_root: PathBuf,
    pub logging: Option<PathBuf>,
}

pub fn prepare(
    client: &mut Downloader,
    instance: &Instance,
    version: &Version,
    platform: &Platform,
    offline: bool,
) -> Result<PreparedGame> {
    ensure!(
        version.id == instance.config.minecraft_version,
        "instance/version mismatch"
    );
    ensure!(
        version.arguments.is_some(),
        "legacy Minecraft argument formats are not supported yet"
    );
    ensure!(
        version.java_version.is_some(),
        "manifest has no Java version requirement"
    );
    let mut classpath = Vec::new();
    for library in &version.libraries {
        if !allowed(&library.rules, platform, true)? {
            continue;
        }
        ensure!(
            library.natives.is_none(),
            "{} needs legacy native extraction, which is not implemented yet",
            library.name
        );
        let artifact = library
            .downloads
            .artifact
            .as_ref()
            .context("library has no downloadable artifact")?;
        let path = artifact
            .path
            .as_ref()
            .context("library artifact has no path")?;
        classpath.push(client.artifact(
            artifact,
            &format!("cache/libraries/{path}"),
            offline,
            "Minecraft library",
        )?);
    }
    let jar = version
        .downloads
        .get("client")
        .context("manifest has no client download")?;
    classpath.push(client.artifact(
        jar,
        &format!("cache/clients/{}.jar", jar.sha1),
        offline,
        "Minecraft client",
    )?);
    let index = &version.asset_index;
    let index_path = client.artifact(
        &index.artifact,
        &format!("cache/assets/indexes/{}.json", index.id),
        offline,
        "Minecraft asset index",
    )?;
    let assets: AssetIndex = serde_json::from_reader(File::open(index_path)?)?;
    ensure!(
        !assets.virtual_ && !assets.map_to_resources,
        "legacy mapped assets are not implemented yet"
    );
    for asset in assets.objects.values() {
        crate::download::validate_hash(&asset.hash)?;
        let suffix = format!("{}/{}", &asset.hash[..2], asset.hash);
        let artifact = Artifact {
            url: format!("https://resources.download.minecraft.net/{suffix}"),
            sha1: asset.hash.clone(),
            size: Some(asset.size),
            path: None,
        };
        client.artifact(
            &artifact,
            &format!("cache/assets/objects/{suffix}"),
            offline,
            "Minecraft asset",
        )?;
    }
    let logging = if let Some(logging) = &version.logging {
        let artifact = &logging.client.file.artifact;
        Some(client.artifact(
            artifact,
            &format!("cache/logging/{}.xml", artifact.sha1),
            offline,
            "Minecraft logging configuration",
        )?)
    } else {
        None
    };
    Ok(PreparedGame {
        classpath,
        assets_root: within(&instance.root, "cache/assets")?,
        logging,
    })
}

/// One-pass substitution: inserted values can never become new placeholders.
pub fn substitute(value: &str, variables: &BTreeMap<String, String>) -> Result<String> {
    let mut output = String::new();
    let mut tail = value;
    while let Some(start) = tail.find("${") {
        output.push_str(&tail[..start]);
        let remaining = &tail[start + 2..];
        let end = remaining
            .find('}')
            .context("unterminated metadata placeholder")?;
        let key = &remaining[..end];
        output.push_str(
            variables
                .get(key)
                .with_context(|| format!("unsupported metadata placeholder: {key}"))?,
        );
        tail = &remaining[end + 1..];
    }
    output.push_str(tail);
    ensure!(!output.contains('\0'), "NUL in launch argument");
    Ok(output)
}

fn expand(
    arguments: &[Argument],
    variables: &BTreeMap<String, String>,
    platform: &Platform,
) -> Result<Vec<String>> {
    let mut output = Vec::new();
    for argument in arguments {
        match argument {
            Argument::Plain(value) => output.push(substitute(value, variables)?),
            Argument::Conditional { rules, value } if allowed(rules, platform, true)? => {
                match value {
                    ArgumentValue::One(value) => output.push(substitute(value, variables)?),
                    ArgumentValue::Many(values) => {
                        for value in values {
                            output.push(substitute(value, variables)?);
                        }
                    }
                }
            }
            _ => {}
        }
    }
    Ok(output)
}

pub struct LaunchPlan {
    pub executable: PathBuf,
    pub arguments: Vec<String>,
    pub working_directory: PathBuf,
    pub logs_directory: PathBuf,
}

pub fn demo_plan(
    instance: &Instance,
    version: &Version,
    prepared: &PreparedGame,
    java: &JavaRuntime,
    platform: &Platform,
) -> Result<LaunchPlan> {
    ensure!(
        version.id == instance.config.minecraft_version,
        "instance/version mismatch"
    );
    ensure!(
        java.major
            == version
                .java_version
                .as_ref()
                .context("Java requirement missing")?
                .major,
        "wrong Java version"
    );
    instance.config.validate()?;
    let args = version
        .arguments
        .as_ref()
        .context("legacy arguments unsupported")?;
    let mut variables = BTreeMap::new();
    for (key, value) in [
        ("auth_player_name", "Player"),
        ("auth_uuid", "00000000000000000000000000000000"),
        ("auth_access_token", "0"),
        ("clientid", ""),
        ("auth_xuid", ""),
        ("user_type", "msa"),
        ("user_properties", "{}"),
        ("launcher_name", "Veil Client"),
        ("launcher_version", env!("CARGO_PKG_VERSION")),
        ("version_name", &version.id),
        ("version_type", &version.kind),
        ("assets_index_name", &version.asset_index.id),
    ] {
        variables.insert(key.into(), value.into());
    }
    let game = instance.path.join("game");
    for (key, path) in [
        ("game_directory", &game),
        ("assets_root", &prepared.assets_root),
        ("natives_directory", &instance.path.join("natives")),
    ] {
        variables.insert(
            key.into(),
            path.to_str()
                .context("non-Unicode data path unsupported")?
                .into(),
        );
    }
    ensure!(!prepared.classpath.is_empty(), "empty Minecraft classpath");
    let classpath = std::env::join_paths(&prepared.classpath).context("invalid classpath entry")?;
    variables.insert(
        "classpath".into(),
        classpath
            .into_string()
            .map_err(|_| anyhow::anyhow!("non-Unicode classpath"))?,
    );
    let mut arguments = vec![format!("-Xmx{}M", instance.config.memory_mib)];
    arguments.extend(expand(&args.jvm, &variables, platform)?);
    if let Some(logging) = &version.logging {
        let path = prepared
            .logging
            .as_ref()
            .context("logging configuration was not prepared")?;
        let values = BTreeMap::from([(
            "path".into(),
            path.to_str().context("invalid logging path")?.into(),
        )]);
        arguments.push(substitute(&logging.client.argument, &values)?);
    }
    arguments.push(version.main_class.clone());
    arguments.extend(expand(&args.game, &variables, platform)?);
    // Explicitly enforce demo, including manifests without a demo feature rule.
    if !arguments.iter().any(|arg| arg == "--demo") {
        arguments.push("--demo".into());
    }
    Ok(LaunchPlan {
        executable: java.executable.clone(),
        arguments,
        working_directory: game,
        logs_directory: instance.path.join("logs"),
    })
}

#[derive(Serialize)]
pub struct LaunchResult {
    pub success: bool,
    pub exit_code: Option<i32>,
    pub elapsed_ms: u128,
}
impl LaunchPlan {
    pub fn run(&self) -> Result<LaunchResult> {
        let log_dir = tempfile::Builder::new()
            .prefix("launch-")
            .tempdir_in(&self.logs_directory)?
            .keep();
        let stdout = File::create(log_dir.join("stdout.log"))?;
        let stderr = File::create(log_dir.join("stderr.log"))?;
        let mut command = Command::new(&self.executable);
        java::clean_environment(&mut command);
        let started = std::time::Instant::now();
        let status = command
            .args(&self.arguments)
            .current_dir(&self.working_directory)
            .stdin(Stdio::null())
            .stdout(stdout)
            .stderr(stderr)
            .status();
        let status = match status {
            Ok(status) => status,
            Err(error) => {
                // OS launch errors only; never serialize a command or account data.
                fs::write(log_dir.join("spawn-error.txt"), error.to_string())?;
                return Err(error)
                    .context("Minecraft process could not start; see local spawn-error.txt");
            }
        };
        let result = LaunchResult {
            success: status.success(),
            exit_code: status.code(),
            elapsed_ms: started.elapsed().as_millis(),
        };
        fs::write(
            log_dir.join("result.json"),
            serde_json::to_vec_pretty(&result)?,
        )?;
        ensure!(
            result.success,
            "Minecraft exited with {:?}; inspect {}",
            result.exit_code,
            log_dir.display()
        );
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn placeholders_are_strict_and_values_are_not_reexpanded() {
        let variables = BTreeMap::from([("dir".into(), "C:/a b/${unknown}".into())]);
        assert_eq!(
            substitute("--path=${dir}", &variables).unwrap(),
            "--path=C:/a b/${unknown}"
        );
        assert!(substitute("${missing}", &variables).is_err());
        assert!(substitute("${dir", &variables).is_err());
    }
    #[test]
    fn official_modern_fixture_builds_demo_arguments_with_spaces() {
        let version: Version =
            serde_json::from_str(include_str!("../tests/fixtures/1.21.1.json")).unwrap();
        let dir = tempfile::tempdir().unwrap();
        let instance =
            Instance::create(&dir.path().join("data with spaces"), "test", "1.21.1").unwrap();
        let prepared = PreparedGame {
            classpath: vec![instance.root.join("client.jar")],
            assets_root: instance.root.join("assets"),
            logging: Some(instance.root.join("logging.xml")),
        };
        for os in ["windows", "linux", "osx"] {
            let platform = Platform {
                os: os.into(),
                arch: "x86_64".into(),
                version: None,
            };
            let java = JavaRuntime {
                executable: "java".into(),
                major: 21,
            };
            let plan = demo_plan(&instance, &version, &prepared, &java, &platform).unwrap();
            assert_eq!(
                plan.arguments
                    .iter()
                    .filter(|value| *value == "--demo")
                    .count(),
                1
            );
            let position = plan
                .arguments
                .iter()
                .position(|value| value == "--gameDir")
                .unwrap();
            assert_eq!(
                plan.arguments[position + 1],
                instance.path.join("game").to_str().unwrap()
            );
            assert!(plan
                .arguments
                .contains(&"net.minecraft.client.main.Main".into()));
            assert!(!plan.arguments.iter().any(|value| value.contains("${")));
            assert_eq!(
                plan.arguments.contains(&"-XstartOnFirstThread".into()),
                os == "osx"
            );
        }
    }
}
