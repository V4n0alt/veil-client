use crate::paths::{data_root, validate_relative, within};
use anyhow::{ensure, Context, Result};
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct Privacy {
    pub telemetry: bool,
    pub analytics: bool,
    pub crash_uploads: bool,
    pub presence: bool,
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(deny_unknown_fields)]
pub struct InstanceConfig {
    pub schema: u32,
    pub minecraft_version: String,
    pub loader: String,
    pub memory_mib: u32,
    #[serde(default)]
    pub privacy: Privacy,
}
impl InstanceConfig {
    pub fn validate(&self) -> Result<()> {
        ensure!(self.schema == 1, "unsupported instance schema");
        ensure!(
            self.loader == "vanilla",
            "mod loaders are not implemented yet"
        );
        ensure!(
            (512..=32768).contains(&self.memory_mib),
            "memory must be between 512 and 32768 MiB"
        );
        ensure!(
            !self.minecraft_version.is_empty() && self.minecraft_version.len() <= 128,
            "invalid Minecraft version"
        );
        Ok(())
    }
}
pub struct Instance {
    pub root: PathBuf,
    pub path: PathBuf,
    pub config: InstanceConfig,
}

fn instance_relative(id: &str) -> Result<String> {
    validate_relative(id)?;
    ensure!(
        !id.contains('/') && id.len() <= 64,
        "instance ID must be a single short path component"
    );
    Ok(format!("instances/{id}"))
}
impl Instance {
    pub fn create(root: &Path, id: &str, minecraft_version: &str) -> Result<Self> {
        let root = data_root(root)?;
        let relative = instance_relative(id)?;
        let path = within(&root, &relative)?;
        let config = InstanceConfig {
            schema: 1,
            minecraft_version: minecraft_version.into(),
            loader: "vanilla".into(),
            memory_mib: 4096,
            privacy: Privacy::default(),
        };
        config.validate()?;
        fs::create_dir_all(within(&root, "instances")?)?;
        fs::create_dir(&path).context(
            "instance already exists or cannot be created; existing data was not changed",
        )?;
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(path.join("instance.json"))?;
        file.write_all(&serde_json::to_vec_pretty(&config)?)?;
        file.sync_all()?;
        for dir in ["game", "logs", "natives"] {
            fs::create_dir(path.join(dir))?;
        }
        Ok(Self { root, path, config })
    }
    pub fn open(root: &Path, id: &str) -> Result<Self> {
        let root = data_root(root)?;
        let relative = instance_relative(id)?;
        let config: InstanceConfig = serde_json::from_reader(File::open(within(
            &root,
            &format!("{relative}/instance.json"),
        )?)?)?;
        config.validate()?;
        for dir in ["game", "logs", "natives"] {
            fs::create_dir_all(within(&root, &format!("{relative}/{dir}"))?)?;
        }
        let path = within(&root, &relative)?;
        Ok(Self { root, path, config })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn isolates_instances_and_never_overwrites_existing_worlds() {
        let dir = tempfile::tempdir().unwrap();
        let first = Instance::create(dir.path(), "first", "1.21.1").unwrap();
        let second = Instance::create(dir.path(), "second", "1.21.1").unwrap();
        assert_ne!(first.path, second.path);
        fs::create_dir(first.path.join("game/saves")).unwrap();
        fs::write(first.path.join("game/saves/world"), b"world").unwrap();
        assert!(Instance::create(dir.path(), "first", "1.20.1").is_err());
        assert_eq!(
            fs::read(first.path.join("game/saves/world")).unwrap(),
            b"world"
        );
        assert!(
            !first.config.privacy.telemetry
                && !first.config.privacy.analytics
                && !first.config.privacy.crash_uploads
                && !first.config.privacy.presence
        );
        assert!(Instance::create(dir.path(), "../outside", "1.21.1").is_err());
    }
}
