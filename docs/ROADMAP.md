# Roadmap

1. Vanilla metadata, verified downloads/cache, Java validation, isolated
   instances, argument construction, logs, and a verified real launch.
2. Microsoft/Minecraft OAuth with OS-secure token storage; separate Fabric,
   Quilt, NeoForge, Forge adapters and compatibility fixtures.
3. Modrinth dependency resolution, local JAR imports, shader/resource packs,
   snapshots and Safe Launch. Never overwrite worlds.
4. Official Voxy profile, hardware detection, measured performance baselines,
   frame-time/1% low analysis and local benchmark comparisons.
5. egui/eframe/wgpu purple glass UI, privacy/network activity page, instance
   and mod UX; suspend animation during gameplay.
6. GitHub releases, integrity/reproducibility, signing and installer; evaluate
   Railway only for optional update metadata that needs a persistent service.

Product requirement (2026-10-08): the profile creator should offer Fresh,
Quality and Performance. Fresh is the default and contains no mods. Quality
and Performance are optional, with their proposed mod/configuration contents
visible before installation. Each profile stays isolated. Existing profiles
must never acquire mods just because a recommended preset changes.

No mods or performance presets are installed by default at this stage. The
7800X3D / RX 9070 XT / 32 GB target profile is a future benchmark target,
not a measured or hard-coded optimization. The design reference is not supplied.
