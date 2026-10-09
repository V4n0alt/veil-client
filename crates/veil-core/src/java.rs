use anyhow::{ensure, Context, Result};
use std::{
    path::{Path, PathBuf},
    process::{Command, Stdio},
};

pub struct JavaRuntime {
    pub executable: PathBuf,
    pub major: u32,
}

pub fn clean_environment(command: &mut Command) {
    for name in [
        "JAVA_TOOL_OPTIONS",
        "_JAVA_OPTIONS",
        "JDK_JAVA_OPTIONS",
        "CLASSPATH",
    ] {
        command.env_remove(name);
    }
}

pub fn parse_major(output: &str) -> Result<u32> {
    let expression =
        regex::Regex::new(r#"(?:openjdk|java) version "([0-9]+)(?:\.([0-9]+))?[^"\r\n]*""#)?;
    let captures = expression
        .captures(output)
        .context("could not parse java -version")?;
    let first: u32 = captures[1].parse()?;
    if first == 1 {
        Ok(captures
            .get(2)
            .context("missing legacy Java major")?
            .as_str()
            .parse()?)
    } else {
        Ok(first)
    }
}

pub fn inspect(executable: &Path) -> Result<JavaRuntime> {
    let mut command = Command::new(executable);
    clean_environment(&mut command);
    let output = command
        .arg("-version")
        .stdin(Stdio::null())
        .output()
        .context("cannot run Java; select a trusted Java executable")?;
    ensure!(output.status.success(), "Java version check failed");
    let text = format!(
        "{}\n{}",
        String::from_utf8_lossy(&output.stderr),
        String::from_utf8_lossy(&output.stdout)
    );
    // A relative custom executable must retain its meaning after game cwd changes.
    let executable = if executable.components().count() > 1 {
        executable
            .canonicalize()
            .context("cannot resolve custom Java path")?
    } else {
        executable.into()
    };
    Ok(JavaRuntime {
        executable,
        major: parse_major(&text)?,
    })
}

pub fn discover(required_major: u32, custom: Option<&Path>) -> Result<JavaRuntime> {
    let mut candidates = Vec::new();
    if let Some(custom) = custom {
        candidates.push(custom.to_owned());
    } else {
        if let Some(home) = std::env::var_os("JAVA_HOME") {
            candidates.push(PathBuf::from(home).join("bin").join(if cfg!(windows) {
                "java.exe"
            } else {
                "java"
            }));
        }
        candidates.push(PathBuf::from("java"));
    }
    for candidate in &candidates {
        match inspect(candidate) {
            Ok(runtime) if runtime.major == required_major => return Ok(runtime),
            Ok(runtime) if custom.is_some() => anyhow::bail!(
                "Java {} selected, but this Minecraft version requires Java {required_major}",
                runtime.major
            ),
            Err(error) if custom.is_some() => return Err(error),
            _ => {}
        }
    }
    anyhow::bail!("Java {required_major} was not found in JAVA_HOME or PATH; supply a matching trusted Java executable (managed installation is not implemented yet)")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn parses_legacy_modern_and_early_access_java() {
        for (text, expected) in [
            ("java version \"1.8.0_402\"", 8),
            ("openjdk version \"17.0.12\" 2024-07-16", 17),
            ("openjdk version \"21.0.4\"", 21),
            ("openjdk version \"25-ea\"", 25),
        ] {
            assert_eq!(parse_major(text).unwrap(), expected);
        }
        assert!(parse_major("not java").is_err());
    }
}
