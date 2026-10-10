# Session record

## 2026-10-10 — UI system and interactive mockup

- Built the owner's new UI brief in a separate React/TypeScript prototype with
  shared purple/charcoal tokens, local Inter font, reusable controls, original
  sunset artwork and six screens. No launcher architecture was replaced.
- Implemented preview profile creation (Fresh default, no mods), optional preset
  disclosure, module search/toggles, inventory movement/crafting, settings,
  accessibility preferences and movable/toggleable HUD widgets. Game readings
  and features are labeled samples; no game, account or mod integration is claimed.
- TypeScript and production build passed locally. DOM interaction checks cover
  the flows above, privacy defaults and no app fetches. Browser visual review
  remains pending because local preview HTTP timed out and browser file URLs are
  blocked. A standalone local bundle is provided for manual review.
- Added a pinned GitHub Actions UI workflow for formatting, type/build checks,
  interaction tests and a downloadable standalone artifact.
- Also completed the previous launcher handoff: run 37979946859 passed all Rust
  checks including Windows Java startup. Downloaded artifact 11641066472,
  verified its SHA-256 and executable checksum, and updated the user's veil-demo
  bundle to source 748f3e6. Preserved the old executable and all profile/cache data.
  The owner still needs to verify the real Minecraft title screen with this fix.

## 2026-10-09 — Windows Java classpath startup fix

- The owner ran the fresh starter: Java 21 was detected, the isolated instance
  was created, and all game files were verified after 3,963 network requests.
  Minecraft then exited with ClassNotFoundException for its main class.
- Reproduced against the downloaded client JAR: Java cannot find Main with a
  Windows verbatim `\\?\` classpath, but loads Main with the standard drive path
  (then reports an expected missing dependency in the single-JAR diagnostic).
- Convert canonical drive/UNC paths only at the Java argument boundary, including
  classpath, assets, game, natives and logging paths. Rust filesystem checks retain
  their canonical paths. Reject ambiguous trailing-dot/space and device paths.
- Added path regression coverage and a Windows CI JDK integration check that
  compiles a tiny Java probe, packs a JAR and launches it through the actual plan.
  Windows CI passed that actual JDK startup check, plus 11 unit tests, Clippy and
  the release build. Linux and macOS checks also passed in run 37933786028. The
  run's formatting-only failure was corrected in the follow-up. A real Minecraft
  graphics launch with the fixed executable still needs verification.

## 2026-10-09 — Fresh profile development test bundle

- Recorded the owner's profile requirement: Fresh is the default, with no mods.
  Future Quality and Performance choices are opt-in and must preview contents.
- Added sampled request progress so initial game downloads show activity.
- Added a Windows release-mode CLI artifact with executable checksum, source
  and checkout commit identifiers, first-test instructions and a double-click
  starter. It reuses Minecraft Launcher's Java 21 and keeps its fresh demo
  profile/cache/worlds in a separate data folder beside the executable.
- CI passed for source commit `0b01155561d0b559cbaa23159691a5835bc7f21b`:
  https://github.com/V4n0alt/veil-client/actions/runs/37894262114.
  Formatting, Clippy, tests and builds passed on all three platforms. The Windows
  release executable was packaged successfully; Linux live/offline checks passed.
- Retrieved artifact 11599846483 and verified its GitHub SHA-256 digest
  `f7f4d653ec2d984e1594e745670f98b36ecee653b72bcaacff5cfaa7e171df24`.
  Extracted only the six expected regular files, verified the executable against
  its checksum file, and ran its help command successfully on the user's host.
- The executable's Java inspection still hits this sandbox's canonicalization
  denial (Windows error 5). Running the same Java directly reports Microsoft
  OpenJDK 21.0.7. No security settings were changed. The next step is to run
  START-DEMO.cmd from File Explorer, outside the agent sandbox, and report whether
  the title screen and demo world open. No real graphics launch is claimed yet.

## 2026-10-08 — GitHub publication and build validation

- The public GitHub repository now exists at
  https://github.com/V4n0alt/veil-client. The owner added it to the connector's
  selected repository access after GitHub rejected the initial write.
- Published three logical project commits and opened draft PR #1. The initial
  setup commit is on `main`; remaining work is on `feat/phase-one-launcher-core`.
  The local branch now tracks the remote. Original local-only branches remain
  available; no history was deleted or force-pushed.
- GitHub Actions successfully ran Clippy, unit tests and builds on Windows,
  Ubuntu and macOS. The first run found formatting differences; retrieved the
  CI-generated patch, verified its SHA-256, and applied it locally. The follow-up
  run passed the independent format check.
- Linux and macOS run 11 core tests; Windows runs 10 (the Unix symlink case is
  conditional). The tests cover hashes, cache corruption, paths, instance/world
  preservation, rule ordering, Java version parsing and actual Mojang metadata
  argument construction. No full game installation or graphics launch test yet.
- Added a Linux CLI smoke check: live Mojang resolution of Minecraft 1.21.1
  succeeded (97 libraries, Java 21 requirement), offline resolution reused the
  cache without launcher network activity, instance creation succeeded, and
  inspection correctly detected the runner's Java 17. This is not proof of a
  Java 21 game launch.
- Evidence: https://github.com/V4n0alt/veil-client/actions/runs/37837185485
  (platform checks passed; formatting failed), and
  https://github.com/V4n0alt/veil-client/actions/runs/37837642038
  (all jobs green: formatted source, all three platforms, live CLI smoke).
- Local Rust canonicalization and Git credential-helper execution remain blocked
  by this Windows sandbox. Used the authorized GitHub connector for publication;
  did not weaken local filesystem or security settings.

### Next highest-priority step

Verify an actual vanilla demo launch using Java 21 and a graphics-capable host,
then an offline relaunch, corrupt-cache recovery and nonzero exit log capture.
Track acceptance criteria in https://github.com/V4n0alt/veil-client/issues/2.
Keep PR #1 in draft until that is demonstrated. Managed Java, Microsoft OAuth,
loaders, UI, design reference, benchmarks and release signing remain outstanding.
No Railway service is needed for this milestone.

## 2026-10-06 — Initial local implementation (historical)

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

## Known issues / next priority at the end of 2026-10-06

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
