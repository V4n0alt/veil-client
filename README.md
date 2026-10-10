# Veil Client

Open-source, privacy-first native Minecraft launcher. **Early Phase 1 development;
not a finished launcher or a verified playable release.**

The Rust core is independent of the future native purple liquid-glass UI.
There is no telemetry, advertising, Veil account, or backend dependency.
Minecraft and third-party mods are not included or relicensed by this repository.
New profiles are Fresh by default: vanilla with no preinstalled mods. The future
profile creator will offer optional Quality and Performance choices, with their
contents shown before installation.

See [start here](CODEX_START_HERE.md), [security](SECURITY.md),
[roadmap](docs/ROADMAP.md), and [session record](docs/SESSION_LOG.md).

## UI design preview

The owner's October 10 UI brief is implemented as a separate interactive
[React/TypeScript prototype](ui-preview/README.md): Main Menu, Inventory,
Features, HUD, Settings and Launcher. It includes shared tokens/components and
Fresh-by-default profile creation. The built preview opens directly from
`index.html`; it does not launch Minecraft or install mods. Native UI integration
remains separate. See [design and validation notes](ui-preview/DESIGN.md).

## Rust development

Install Rust 1.96.0 with rustfmt and clippy (Windows: Microsoft C++ build tools
for the default MSVC target). Then:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
cargo build --workspace --locked
```

## Initial command-line pipeline

For a Windows development test without installing Rust, successful Windows CI
jobs produce a `veil-windows-development` artifact. Extract the complete bundle
and double-click `START-DEMO.cmd`; see `FIRST-TEST.txt` inside. The starter reuses
Java 21 from the official Minecraft Launcher or a supplied `VEIL_JAVA` path. It
creates an isolated Minecraft 1.21.1 demo profile with no mods. This is an unsigned
development build, without Microsoft sign-in or the finished launcher UI.

The implementation includes official version resolution, streamed SHA-1/size
verification, cache reuse, isolated instances, Java major-version checks,
modern vanilla classpath/argument construction, and local process logs.
Builds, Clippy and unit tests have passed in GitHub Actions on Windows, Linux
and macOS. Formatting is checked separately. Linux CI also exercises live Mojang
version resolution, offline cache reuse, instance creation and Java inspection.
**A real Minecraft launch is still unverified.** The local development sandbox
continues to deny Rust filesystem canonicalization; CI provides the build and
test evidence. See the session record for exact scope and results.

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
Network progress prints sampled domains/purposes as requests start and a total
request count, including when preparation fails. The core retains all request
events in memory for the future activity UI.
There is no persistent network activity page yet.

Supported initial target: modern vanilla metadata, x86-64 Windows/Linux/macOS.
The 1.21.1 fixture exercises Java 21 and modern argument rules. Old native
extraction/mapped assets, OS-version-specific rules, ARM launch, managed Java,
OAuth, loaders, mods and GUI are not implemented. No FPS was measured.

## Local repository and GitHub

The remote is [V4n0alt/veil-client](https://github.com/V4n0alt/veil-client).
Phase 1 lives on `feat/phase-one-launcher-core` in
[draft PR #1](https://github.com/V4n0alt/veil-client/pull/1).
The local active branch tracks that remote branch; earlier local-only history
is preserved in separate branches. Do not merge until CI and the real launch
check pass.

GitHub Actions checks formatting, Clippy, tests and builds on Windows, Linux
and macOS. Failed formatting produces a reviewable patch artifact, without
writing code from CI. Dependabot covers Rust dependencies and GitHub Actions.
Releases/signing/security audit remain release blockers.
Railway has no role in this local Phase 1 pipeline, so no service was created.
