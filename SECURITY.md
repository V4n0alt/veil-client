# Security policy and current boundaries

This project is pre-alpha. Do not publish credentials in issues. A private
vulnerability reporting channel must be configured when the GitHub repository
is created; until then contact the repository owner privately.

- No passwords or Microsoft tokens are collected or persisted in Phase 1.
- Network requests use verified HTTPS to explicit Mojang/Minecraft hosts only;
  redirects, URL credentials, fragments and nonstandard ports are rejected.
- Hashes and lengths supplied by Mojang are checked before cache publication.
  The root version list is authenticated by HTTPS, not a detached signature.
- Paths reject traversal, absolute paths, Windows device names and alternate
  streams. Existing symlinks/junctions are rejected along managed paths.
- The data root must be private to the current OS user. This is not a sandbox
  against another process running as that user; concurrent path replacement
  attacks by that process are outside this initial filesystem design.
- Java is launched directly using argument arrays, never a shell. Custom Java
  executables are user-selected trusted programs. Java environment injection
  variables are removed before execution.
- Game output remains local. It may include chat/server information; do not
  upload logs automatically. No general token-redaction claim is made yet.
- Telemetry, analytics, presence and crash uploads are OFF, with no upload code.
- No Railway service, secrets, third-party mod binary, or updater is included.

Release blockers include OAuth credential storage, broader platform/game
coverage, authenticated launch verification, dependency audit, artifact signing
and release provenance. A successful unit test is not proof of a playable game.
