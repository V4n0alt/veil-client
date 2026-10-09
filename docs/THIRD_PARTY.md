# Third-party components

Veil source uses the MIT license. Rust crate dependencies keep their upstream
licenses; Cargo.lock records exact versions and registry checksums. Direct
dependencies are anyhow (MIT OR Apache-2.0), serde (MIT OR Apache-2.0),
serde_json (MIT OR Apache-2.0), reqwest (MIT OR Apache-2.0), sha1
(MIT OR Apache-2.0), tempfile (MIT OR Apache-2.0), and regex
(MIT OR Apache-2.0). Audit the full transitive graph and include its notices
before producing distributable binaries.

`crates/veil-core/tests/fixtures/1.21.1.json` is unmodified official Mojang
version metadata, fetched through the version manifest on 2026-10-06.
Its canonical source URL and SHA-1 are in fixtures/SOURCE.json. It is metadata,
not a copy of the Minecraft game or assets; it remains third-party material.
Minecraft game binaries/assets are downloaded only on user request and remain
subject to Mojang/Microsoft terms. Veil is not affiliated with Mojang/Microsoft.

No third-party mods, Voxy binaries, fonts, images or design references are
bundled. No performance claims are inferred from upstream projects.
