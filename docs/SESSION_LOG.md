# Session record — 2026-10-06

## Implemented

- Created a new local Git repository after the owner authorized creating one.
  No existing code or visual reference was available. MIT license, architecture,
  start-here instructions, security policy, roadmap and third-party notes added.
- Native Rust workspace: reusable `veil-core` and thin `veil-cli`.
- Official Minecraft version list and SHA-1-verified version metadata resolver.
- HTTPS host allowlist, redirect rejection, timeouts, streaming bounded downloads,
  hash/size verification, temporary-file publication and verified cache reuse.
- Offline cache mode, per-request local domain/purpose records, no upload code.
- Isolated instance creation without overwriting existing directories/worlds.
- Java parsing for 8/17/21/25-style versions; custom executable, JAVA_HOME/PATH
  lookup and exact required-major selection; Java injection environment removed.
- Modern vanilla library/rule selection, assets, logging config, classpath,
  strict placeholder expansion, explicit demo-only command, per-launch logs.
- Unit tests for malformed hashes/downloads, unsafe hosts/paths, corrupt caches,
  rule ordering, Java versions, preserved worlds, privacy defaults, placeholders,
  and the actual Mojang 1.21.1 manifest on three simulated OS profiles.
- Least-privilege CI matrix for format/Clippy/test/build, pinned checkout action,
  Cargo.lock and Dependabot configuration. No external CI run yet.

## Checks actually performed

- Read full user brief; GitHub connector repository discovery found no Veil repo.
  Connector tool inventory has no repository-creation operation. No GitHub CLI
  or pre-existing Rust installation was available.
- Installed isolated official GNU Rust toolchains (1.99.0 and 1.96.0) under the
  session's work directory, without modifying global PATH or installing system
  build tools. A standalone Rust compiler/linker smoke program compiled and ran.
- Downloaded Mojang's official version list and 1.21.1 metadata. PowerShell
  verified fixture SHA-1 `cedfc3b6dcbca34e2b478d498bf1d56a8fa2f404` against the
  version list. This verifies fixture provenance, not the Rust implementation.
- Cargo resolved and locked dependencies, but `cargo test --workspace --locked`
  could not unpack its first dependency: `Access is denied` while canonicalizing
  the registry directory. Reproduced with a shorter path and an explicit grant
  for that build directory. No crate tests were executed.
- `cargo fmt` and direct rustfmt (including stdin mode) hit the same Windows
  permission error. A small Rust probe confirmed `current_dir` and `metadata`
  work while `std::fs::canonicalize` returns Windows error 5.
- Full build and Clippy are subject to the same blocker. Neither is passed.
  No executable release, successful Minecraft launch, benchmark, remote commit,
  PR, deployment or release is claimed.

## Current known issues / next priority

1. On a host where Rust filesystem calls work, run `scripts/verify.ps1` (or the
   equivalent documented commands), fix any compiler/linter/test failures and
   commit formatting. Initial code is not format/build verified.
2. Verify a real vanilla demo launch with Java 21 and graphics support, including
   offline relaunch, deliberately corrupted cache and nonzero exit logs.
3. Create the empty GitHub remote (unsupported by this connector), connect it,
   push the local feature branch and open a draft PR. Observe CI before merging.
4. Add managed Java installation and remaining legacy/platform coverage, then
   implement legitimate Microsoft OAuth with OS-secure tokens for owned play.
5. Obtain the supplied Veil design reference before the GUI phase. No UI or
   performance preset is represented as implemented.

Railway was intentionally not provisioned: Phase 1 needs no persistent backend.
