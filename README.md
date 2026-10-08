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

CLI commands and verified capabilities are recorded below as implementation lands.
