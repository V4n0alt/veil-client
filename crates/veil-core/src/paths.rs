use anyhow::{bail, ensure, Result};
use std::{
    fs,
    path::{Path, PathBuf},
};

pub fn validate_relative(value: &str) -> Result<()> {
    ensure!(
        !value.is_empty() && value.len() <= 240,
        "invalid path length"
    );
    for part in value.split('/') {
        ensure!(
            !part.is_empty() && part != "." && part != "..",
            "unsafe path component"
        );
        ensure!(
            part.bytes()
                .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b)),
            "unsafe path characters"
        );
        ensure!(!part.ends_with('.'), "trailing dots are forbidden");
        let stem = part.split('.').next().unwrap_or("").to_ascii_uppercase();
        ensure!(
            !matches!(
                stem.as_str(),
                "CON" | "PRN" | "AUX" | "NUL" | "CONIN$" | "CONOUT$"
            ),
            "reserved device path"
        );
        ensure!(
            !(stem.len() == 4
                && (stem.starts_with("COM") || stem.starts_with("LPT"))
                && stem.as_bytes()[3].is_ascii_digit()),
            "reserved device path"
        );
    }
    Ok(())
}

/// All callers use a canonical, user-owned root. Reject managed reparse paths.
pub fn within(root: &Path, relative: &str) -> Result<PathBuf> {
    validate_relative(relative)?;
    let mut path = root.to_path_buf();
    for part in relative.split('/') {
        path.push(part);
        match fs::symlink_metadata(&path) {
            Ok(meta) => {
                ensure!(!meta.file_type().is_symlink(), "symlink in managed path");
                #[cfg(windows)]
                {
                    use std::os::windows::fs::MetadataExt;
                    ensure!(
                        meta.file_attributes() & 0x400 == 0,
                        "reparse point in managed path"
                    );
                }
                ensure!(
                    path.canonicalize()?.starts_with(root),
                    "path escapes data root"
                );
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => bail!(e),
        }
    }
    Ok(path)
}

pub fn data_root(path: &Path) -> Result<PathBuf> {
    fs::create_dir_all(path)?;
    Ok(path.canonicalize()?)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_cross_platform_traversal_and_devices() {
        for path in [
            "../world",
            "/absolute",
            "C:/data",
            "a\\b",
            "a//b",
            "a/./b",
            "a:stream",
            "CON.txt",
            "lpt1",
            "trail.",
            "",
        ] {
            assert!(validate_relative(path).is_err(), "{path}");
        }
        assert!(validate_relative("libraries/org/example-1.2.jar").is_ok());
    }
    #[cfg(unix)]
    #[test]
    fn rejects_symlink_escape() {
        let root = tempfile::tempdir().unwrap();
        let outside = tempfile::tempdir().unwrap();
        std::os::unix::fs::symlink(outside.path(), root.path().join("escape")).unwrap();
        assert!(within(root.path(), "escape/world").is_err());
    }
}
