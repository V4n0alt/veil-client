# Veil Client — start here

Read this file, README.md, SECURITY.md, docs/ROADMAP.md, docs/SESSION_LOG.md,
docs/ARCHITECTURE.md, and the source before changing architecture.

This is a new repository, created because no existing Veil repository or design
reference was available. No prior launcher architecture was replaced.

The current milestone is Phase 1: a native Rust launcher core and command-line
development interface. The future egui/eframe/wgpu UI must remain separate.
Do not advertise a playable release until a real game launch has been verified.

Principles:
- All game launching remains local and independent of a Veil backend.
- Telemetry, analytics, crash uploads, and presence default OFF.
- No Veil account; Microsoft OAuth belongs in Phase 2. Never collect passwords.
- Use official Mojang metadata and verify provided hashes before using files.
- Never delete or overwrite worlds during installation or recovery.
- Voxy is the far-view renderer; unsupported combinations must say
  "Voxy unavailable for this profile". Do not substitute other renderers.
- No FPS or performance claims without recorded measurements.
- New profiles default to Fresh: vanilla Minecraft with no preinstalled mods.
  The future profile creator offers Fresh, Quality and Performance. Quality and
  Performance are opt-in selections with their proposed contents shown first;
  never silently add mods to Fresh profiles or existing profiles.
- Do not create Railway infrastructure until a persistent backend is needed.

Before committing: cargo fmt --all -- --check; cargo clippy --workspace
--all-targets --locked -- -D warnings; cargo test --workspace --locked;
cargo build --workspace --locked. Keep Cargo.lock committed.

The supplied visual reference is still missing. The written design is purple,
lilac, dark graphite glass, restrained motion; do not invent a matching reference.
