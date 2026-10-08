use crate::download::{Artifact, Downloader};
use anyhow::{ensure, Context, Result};
use serde::Deserialize;
use std::{collections::BTreeMap, fs::File};

#[derive(Deserialize, Debug)]
pub struct VersionManifest {
    pub latest: Latest,
    pub versions: Vec<VersionEntry>,
}
#[derive(Deserialize, Debug)]
pub struct Latest { pub release: String, pub snapshot: String }
#[derive(Deserialize, Debug)]
pub struct VersionEntry {
    pub id: String,
    pub url: String,
    pub sha1: String,
    #[serde(rename = "type")]
    pub kind: String,
}
impl VersionManifest {
    pub fn find(&self, id: &str) -> Result<&VersionEntry> {
        self.versions.iter().find(|entry| entry.id == id).context("Minecraft version not found in official manifest")
    }
}

#[derive(Deserialize, Debug)]
pub struct Version {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    #[serde(rename = "mainClass")]
    pub main_class: String,
    #[serde(rename = "javaVersion")]
    pub java_version: Option<JavaVersion>,
    pub downloads: BTreeMap<String, Artifact>,
    #[serde(rename = "assetIndex")]
    pub asset_index: AssetIndexRef,
    pub libraries: Vec<Library>,
    pub arguments: Option<Arguments>,
    pub logging: Option<Logging>,
}
#[derive(Deserialize, Debug)]
pub struct JavaVersion { #[serde(rename = "majorVersion")] pub major: u32 }
#[derive(Deserialize, Debug)]
pub struct AssetIndexRef {
    pub id: String,
    #[serde(flatten)]
    pub artifact: Artifact,
}
#[derive(Deserialize, Debug)]
pub struct AssetIndex {
    pub objects: BTreeMap<String, Asset>,
    #[serde(default, rename = "virtual")]
    pub virtual_: bool,
    #[serde(default)]
    pub map_to_resources: bool,
}
#[derive(Deserialize, Debug)]
pub struct Asset { pub hash: String, pub size: u64 }
#[derive(Deserialize, Debug)]
pub struct Library {
    pub name: String,
    pub downloads: LibraryDownloads,
    #[serde(default)]
    pub rules: Vec<Rule>,
    pub natives: Option<BTreeMap<String, String>>,
}
#[derive(Deserialize, Debug)]
pub struct LibraryDownloads { pub artifact: Option<Artifact> }
#[derive(Deserialize, Debug)]
pub struct Arguments { pub game: Vec<Argument>, pub jvm: Vec<Argument> }
#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum Argument {
    Plain(String),
    Conditional { rules: Vec<Rule>, value: ArgumentValue },
}
#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum ArgumentValue { One(String), Many(Vec<String>) }
#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
pub struct Rule {
    pub action: Action,
    pub os: Option<OsRule>,
    #[serde(default)]
    pub features: BTreeMap<String, bool>,
}
#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Action { Allow, Disallow }
#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
pub struct OsRule { pub name: Option<String>, pub arch: Option<String>, pub version: Option<String> }
#[derive(Deserialize, Debug)]
pub struct Logging { pub client: LoggingClient }
#[derive(Deserialize, Debug)]
pub struct LoggingClient { pub argument: String, pub file: LoggingFile }
#[derive(Deserialize, Debug)]
pub struct LoggingFile { pub id: String, #[serde(flatten)] pub artifact: Artifact }

pub struct Platform { pub os: String, pub arch: String, pub version: Option<String> }
impl Platform {
    pub fn current() -> Result<Self> {
        ensure!(std::env::consts::ARCH == "x86_64", "Phase 1 currently supports x86-64 hosts only");
        let os = match std::env::consts::OS {
            "windows" => "windows", "linux" => "linux", "macos" => "osx",
            _ => anyhow::bail!("unsupported operating system"),
        };
        Ok(Self { os: os.into(), arch: "x86_64".into(), version: None })
    }
}

pub fn allowed(rules: &[Rule], platform: &Platform, demo: bool) -> Result<bool> {
    if rules.is_empty() { return Ok(true); }
    let mut result = false;
    for rule in rules {
        if let Some(os) = &rule.os {
            if os.name.as_ref().is_some_and(|name| *name != platform.os) { continue; }
            if os.arch.as_ref().is_some_and(|arch| *arch != platform.arch) { continue; }
            if let Some(pattern) = &os.version {
                let version = platform.version.as_ref().context("OS-version-specific rules are not supported on this host yet")?;
                if !regex::Regex::new(pattern)?.is_match(version) { continue; }
            }
        }
        if rule.features.iter().any(|(name, expected)| *expected != (name == "is_demo_user" && demo)) { continue; }
        result = matches!(rule.action, Action::Allow);
    }
    Ok(result)
}

pub fn resolve(client: &mut Downloader, id: &str, offline: bool) -> Result<Version> {
    let manifest = client.manifest(offline)?;
    let entry = manifest.find(id)?;
    let artifact = Artifact { url: entry.url.clone(), sha1: entry.sha1.clone(), size: None, path: None };
    let file = client.artifact(&artifact, &format!("cache/versions/{}.json", artifact.sha1), offline, "Minecraft version metadata")?;
    let version: Version = serde_json::from_reader(File::open(file)?)?;
    ensure!(version.id == id, "version metadata identity mismatch");
    Ok(version)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rules_use_last_matching_action_and_deny_by_default() {
        let rules = serde_json::from_str::<Vec<Rule>>(r#"[{"action":"allow"},{"action":"disallow","os":{"name":"windows"}}]"#).unwrap();
        let windows = Platform { os: "windows".into(), arch: "x86_64".into(), version: None };
        assert!(!allowed(&rules, &windows, false).unwrap());
        let linux = Platform { os: "linux".into(), ..windows };
        assert!(allowed(&rules, &linux, false).unwrap());
        let demo = serde_json::from_str::<Vec<Rule>>(r#"[{"action":"allow","features":{"is_demo_user":true}}]"#).unwrap();
        assert!(!allowed(&demo, &linux, false).unwrap());
        assert!(allowed(&demo, &linux, true).unwrap());
    }
    #[test]
    fn rejects_unknown_rule_actions() {
        assert!(serde_json::from_str::<Rule>(r#"{"action":"maybe"}"#).is_err());
    }
}
