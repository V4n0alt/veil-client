use crate::paths::{data_root, within};
use anyhow::{ensure, Context, Result};
use reqwest::{blocking::Client, redirect::Policy, Url};
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};
use std::{
    fs::{self, File},
    io::{Read, Write},
    path::{Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

pub const MANIFEST_URL: &str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const MAX_ARTIFACT: u64 = 1024 * 1024 * 1024;
const MAX_JSON: u64 = 16 * 1024 * 1024;

#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct Artifact {
    pub url: String,
    pub sha1: String,
    pub size: Option<u64>,
    pub path: Option<String>,
}

impl Artifact {
    pub fn validate(&self) -> Result<()> {
        validate_url(&self.url)?;
        validate_hash(&self.sha1)?;
        ensure!(
            self.size.unwrap_or(0) <= MAX_ARTIFACT,
            "artifact exceeds size limit"
        );
        Ok(())
    }
}

pub fn validate_hash(hash: &str) -> Result<()> {
    ensure!(
        hash.len() == 40
            && hash
                .bytes()
                .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase()),
        "invalid SHA-1 digest"
    );
    Ok(())
}

pub fn validate_url(value: &str) -> Result<Url> {
    let url = Url::parse(value)?;
    ensure!(
        url.scheme() == "https"
            && url.username().is_empty()
            && url.password().is_none()
            && url.port().is_none()
            && url.fragment().is_none()
            && url.query().is_none(),
        "unsafe download URL"
    );
    ensure!(
        matches!(
            url.host_str(),
            Some(
                "piston-meta.mojang.com"
                    | "piston-data.mojang.com"
                    | "launchermeta.mojang.com"
                    | "launcher.mojang.com"
                    | "libraries.minecraft.net"
                    | "resources.download.minecraft.net"
            )
        ),
        "download host is not an official allowed source"
    );
    Ok(url)
}

#[derive(Serialize, Debug)]
pub struct NetworkEvent {
    pub domain: String,
    pub purpose: String,
    pub contacted_at_unix: u64,
    pub component: &'static str,
    pub required: bool,
}

pub struct Downloader {
    client: Client,
    root: PathBuf,
    pub activity: Vec<NetworkEvent>,
}

impl Downloader {
    pub fn new(root: &Path) -> Result<Self> {
        Ok(Self {
            client: Client::builder()
                .user_agent("VeilClient/0.1.0")
                .redirect(Policy::none())
                .connect_timeout(Duration::from_secs(15))
                .timeout(Duration::from_secs(180))
                .https_only(true)
                .build()?,
            root: data_root(root)?,
            activity: Vec::new(),
        })
    }

    fn get(&mut self, url: &str, purpose: &str) -> Result<reqwest::blocking::Response> {
        let url = validate_url(url)?;
        self.activity.push(NetworkEvent {
            domain: url.host_str().unwrap_or_default().into(),
            purpose: purpose.into(),
            contacted_at_unix: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
            component: "minecraft-downloads",
            required: true,
        });
        let response = self
            .client
            .get(url)
            .send()
            .context("HTTPS download failed")?;
        ensure!(
            response.status().is_success(),
            "download returned HTTP {}",
            response.status()
        );
        Ok(response)
    }

    pub fn manifest(&mut self, offline: bool) -> Result<crate::metadata::VersionManifest> {
        let path = within(&self.root, "cache/version-manifest.json")?;
        if offline {
            return serde_json::from_reader(
                File::open(path).context("no cached version list; fetch it online first")?,
            )
            .context("invalid cached manifest");
        }
        let response = self.get(MANIFEST_URL, "Minecraft version list")?;
        let mut bytes = Vec::new();
        response.take(MAX_JSON + 1).read_to_end(&mut bytes)?;
        ensure!(bytes.len() as u64 <= MAX_JSON, "version list too large");
        let manifest = serde_json::from_slice(&bytes).context("invalid version list")?;
        atomic_write(&path, &bytes)?;
        Ok(manifest)
    }

    pub fn artifact(
        &mut self,
        artifact: &Artifact,
        relative: &str,
        offline: bool,
        purpose: &str,
    ) -> Result<PathBuf> {
        artifact.validate()?;
        let destination = within(&self.root, relative)?;
        if destination.is_file() && verify_file(&destination, artifact)? {
            return Ok(destination);
        }
        ensure!(!offline, "verified artifact missing from cache: {relative}");
        fs::create_dir_all(destination.parent().context("missing cache parent")?)?;
        let response = self.get(&artifact.url, purpose)?;
        if let (Some(actual), Some(expected)) = (response.content_length(), artifact.size) {
            ensure!(actual == expected, "download length mismatch");
        }
        let mut temp = tempfile::NamedTempFile::new_in(destination.parent().unwrap())?;
        copy_verified(response, temp.as_file_mut(), artifact)?;
        temp.as_file().sync_all()?;
        temp.persist(&destination)
            .context("cannot publish verified cache entry")?;
        Ok(destination)
    }
}

pub fn copy_verified(
    mut reader: impl Read,
    mut writer: impl Write,
    artifact: &Artifact,
) -> Result<()> {
    validate_hash(&artifact.sha1)?;
    let limit = artifact.size.unwrap_or(MAX_ARTIFACT).min(MAX_ARTIFACT);
    let mut hasher = Sha1::new();
    let mut size = 0_u64;
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let n = reader.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        size += n as u64;
        ensure!(size <= limit, "download exceeds expected size");
        hasher.update(&buffer[..n]);
        writer.write_all(&buffer[..n])?;
    }
    ensure!(
        artifact.size.is_none_or(|expected| size == expected),
        "download is incomplete"
    );
    ensure!(
        format!("{:x}", hasher.finalize()) == artifact.sha1,
        "SHA-1 mismatch; download rejected"
    );
    Ok(())
}

pub fn verify_file(path: &Path, artifact: &Artifact) -> Result<bool> {
    let file = File::open(path)?;
    if artifact
        .size
        .is_some_and(|size| file.metadata().map(|m| m.len() != size).unwrap_or(true))
    {
        return Ok(false);
    }
    Ok(copy_verified(file, std::io::sink(), artifact).is_ok())
}

pub fn atomic_write(path: &Path, bytes: &[u8]) -> Result<()> {
    let parent = path.parent().context("missing parent")?;
    fs::create_dir_all(parent)?;
    let mut file = tempfile::NamedTempFile::new_in(parent)?;
    file.write_all(bytes)?;
    file.as_file().sync_all()?;
    file.persist(path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    fn sample() -> Artifact {
        Artifact {
            url: "https://piston-data.mojang.com/test".into(),
            sha1: "a9993e364706816aba3e25717850c26c9cd0d89d".into(),
            size: Some(3),
            path: None,
        }
    }
    #[test]
    fn verifies_and_rejects_corruption_truncation_and_excess() {
        assert!(copy_verified(&b"abc"[..], Vec::new(), &sample()).is_ok());
        for bytes in [&b"abd"[..], &b"ab"[..], &b"abcd"[..]] {
            assert!(copy_verified(bytes, Vec::new(), &sample()).is_err());
        }
    }
    #[test]
    fn blocks_untrusted_sources() {
        for url in [
            "http://libraries.minecraft.net/a",
            "https://libraries.minecraft.net.evil.com/a",
            "https://user@libraries.minecraft.net/a",
            "https://libraries.minecraft.net:444/a",
            "https://127.0.0.1/a",
            "https://libraries.minecraft.net/a?token=x",
        ] {
            assert!(validate_url(url).is_err(), "{url}");
        }
    }
    #[test]
    fn offline_cache_reuses_only_verified_bytes() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("artifact"), b"abc").unwrap();
        let mut client = Downloader::new(dir.path()).unwrap();
        assert!(client.artifact(&sample(), "artifact", true, "test").is_ok());
        fs::write(dir.path().join("artifact"), b"bad").unwrap();
        assert!(client
            .artifact(&sample(), "artifact", true, "test")
            .is_err());
        assert!(client.activity.is_empty());
        assert_eq!(fs::read(dir.path().join("artifact")).unwrap(), b"bad");
    }
}
