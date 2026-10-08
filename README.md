# Veil Client

Open-source, privacy-first native Minecraft launcher. **Early Phase 1 development;
not a finished launcher or a verified playable release.**

The Rust core is independent of the future native purple liquid-glass UI.
There is no telemetry, advertising, Veil account, or backend dependency.
Minecraft and third-party mods are not included or relicensed by this repository.

See [start here](CODEX_START_HERE.md), [security](SECURITY.md),
[roadmap](docs/ROADMAP.md), and [session record](docs/SESSION_LOG.md).

## Development

Install stable Rust with rustfmt and clippy (Windows: Microsoft C++ build tools
for the default MSVC target). Then:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
cargo build --workspace --locked
```

## Initial command-line pipeline

The implementation includes official version resolution, streamed SHA-1/size
verification, cache reuse, isolated instances, Java major-version checks,
modern vanilla classpath/argument construction, and local process logs.
**Compilation, tests and game launch are currently unverified** because the
development sandbox denied Rust filesystem canonicalization. See the session
record before using this code. Formatting still needs to run on a working host.

After building, use these commands (Windows executable: `target/debug/veil.exe`):

```sh
cargo run -p veil-cli -- versions ./veil-data
cargo run -p veil-cli -- resolve ./veil-data 1.21.1
cargo run -p veil-cli -- init ./veil-data vanilla-demo 1.21.1
cargo run -p veil-cli -- java /path/to/java
cargo run -p veil-cli -- prepare ./veil-data vanilla-demo
cargo run -p veil-cli -- demo ./veil-data vanilla-demo --java /path/to/java
```

For Windows, provide a quoted path to your Java 21 `java.exe` for this example.
`prepare` downloads the game, assets, libraries and logging config, potentially
several GB. It does not install Java. `demo` checks Java first, prepares files and
launches with `--demo`; it does not grant authenticated play or bypass ownership.

`versions`, `resolve`, `prepare` and `demo` accept `--offline`. Offline mode
performs no launcher HTTP requests and requires the appropriate verified cache.
Minecraft itself may still make network requests. The online version-list
request refreshes the manifest; unchanged hash-verified artifacts are reused.
Network domains/purposes are printed locally, including when preparation fails.
There is no persistent network activity page yet.

Supported initial target: modern vanilla metadata, x86-64 Windows/Linux/macOS.
The 1.21.1 fixture exercises Java 21 and modern argument rules. Old native
extraction/mapped assets, OS-version-specific rules, ARM launch, managed Java,
OAuth, loaders, mods and GUI are not implemented. No FPS was measured.

## Local repository and GitHub

This directory is a Git repository with `main` and
`feat/phase-one-launcher-core`. It has logical local commits, but no remote.
The connected GitHub plugin cannot create repositories, and no authenticated
GitHub CLI was available. The unsupported setup action is to create an empty
GitHub repository named `veil-client` and grant the connector access to it.
After that, the existing branches can be pushed and a draft PR opened; do not
merge until CI and the real launch check pass.

GitHub Actions checks formatting, Clippy, tests and builds on Windows, Linux
and macOS. Dependabot covers Rust dependencies and GitHub Actions. The workflow
has not run remotely. Releases/signing/security audit remain release blockers.
Railway has no role in this local Phase 1 pipeline, so no service was created.
