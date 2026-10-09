# Architecture

`veil-core` owns metadata, integrity/cache, filesystem boundaries, Java checks,
instances and launch planning. `veil-cli` is a thin development interface.
The future UI calls the same core without embedding game logic in widgets.

Phase 1 starts with modern vanilla manifests using `arguments` and libraries
whose natives are packaged on the classpath. Legacy native extraction, managed
Java installation, loaders and authenticated play are separate milestones.
Unsupported metadata must fail explicitly, never guess at a launch command.

Downloads are sequential and streamed to same-directory temporary files with
bounded lengths, TLS verification, an official-host allowlist and no redirects.
SHA-1 follows Mojang's manifest integrity contract, not a modern signature scheme.
Existing cached files are rehashed; partial or corrupt downloads never become
valid cache entries. No archive extraction or arbitrary downloaded scripts.

Data stays under a user-selected root. Instances contain their own game directory,
logs and config. Shared immutable artifacts live in the root cache. No world
management, automatic cleanup or upload exists yet. Only demo launch is exposed
until legitimate OAuth is implemented; demo is always explicitly passed to Java.
