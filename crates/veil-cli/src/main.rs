use anyhow::{ensure, Context, Result};
use std::path::Path;
use veil_core::{
    download::Downloader,
    instance::Instance,
    java, launch,
    metadata::{self, Platform},
};

const HELP: &str = "Veil Client — Phase 1 development CLI\n\nCommands:\n  veil versions <data-root> [--offline]\n  veil resolve <data-root> <minecraft-version> [--offline]\n  veil init <data-root> <instance-id> <minecraft-version>\n  veil java <java-executable>\n  veil prepare <data-root> <instance-id> [--offline]\n  veil demo <data-root> <instance-id> [--java <executable>] [--offline]\n\nprepare downloads official game files (potentially several GB).\ndemo starts Minecraft in demo mode. Microsoft sign-in is not implemented yet.\nAll data is local; no telemetry, analytics, presence, or crash uploads.\n";

fn main() {
    if let Err(error) = run() {
        eprintln!("Veil: {error:#}");
        std::process::exit(1);
    }
}

fn run() -> Result<()> {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() || matches!(args[0].as_str(), "--help" | "-h" | "help") {
        print!("{HELP}");
        return Ok(());
    }
    let offline = args.iter().any(|arg| arg == "--offline");
    args.retain(|arg| arg != "--offline");
    let mut custom_java = None;
    if let Some(index) = args.iter().position(|arg| arg == "--java") {
        ensure!(
            args.first().is_some_and(|arg| arg == "demo"),
            "--java applies only to demo"
        );
        ensure!(index + 1 < args.len(), "--java requires an executable path");
        custom_java = Some(args.remove(index + 1));
        args.remove(index);
    }
    let command = args.first().context("missing command")?.as_str();
    if command == "java" {
        ensure!(args.len() == 2, "usage: veil java <executable>");
        let runtime = java::inspect(Path::new(&args[1]))?;
        println!("Java {}: {}", runtime.major, runtime.executable.display());
        return Ok(());
    }
    if command == "init" {
        ensure!(
            args.len() == 4,
            "usage: veil init <data-root> <instance-id> <minecraft-version>"
        );
        let instance = Instance::create(Path::new(&args[1]), &args[2], &args[3])?;
        println!("Created {} at {}", args[2], instance.path.display());
        return Ok(());
    }
    ensure!(
        matches!(command, "versions" | "resolve" | "prepare" | "demo"),
        "unknown command; use --help"
    );
    ensure!(
        args.len() == if command == "versions" { 2 } else { 3 },
        "incorrect arguments; use --help"
    );
    let root = Path::new(&args[1]);
    let mut client = Downloader::new(root)?;
    // Print only domain/purpose; never headers, full URLs, or future account secrets.
    let outcome = (|| -> Result<()> {
        match command {
            "versions" => {
                let manifest = client.manifest(offline)?;
                println!("Latest release: {}", manifest.latest.release);
                for version in manifest.versions.iter().take(30) {
                    println!("{} ({})", version.id, version.kind);
                }
            }
            "resolve" => {
                let version = metadata::resolve(&mut client, &args[2], offline)?;
                println!(
                    "{}: {} libraries; Java {}; main class {}",
                    version.id,
                    version.libraries.len(),
                    version
                        .java_version
                        .as_ref()
                        .map(|v| v.major.to_string())
                        .unwrap_or_else(|| "unknown".into()),
                    version.main_class
                );
            }
            "prepare" | "demo" => {
                let instance = Instance::open(root, &args[2])?;
                let version =
                    metadata::resolve(&mut client, &instance.config.minecraft_version, offline)?;
                let platform = Platform::current()?;
                // Check Java before downloading a large install when launching.
                let runtime = if command == "demo" {
                    Some(java::discover(
                        version
                            .java_version
                            .as_ref()
                            .context("Java requirement missing")?
                            .major,
                        custom_java.as_deref().map(Path::new),
                    )?)
                } else {
                    None
                };
                let prepared =
                    launch::prepare(&mut client, &instance, &version, &platform, offline)?;
                println!(
                    "Verified Minecraft {} ({} classpath entries)",
                    version.id,
                    prepared.classpath.len()
                );
                if let Some(runtime) = runtime {
                    let plan =
                        launch::demo_plan(&instance, &version, &prepared, &runtime, &platform)?;
                    println!(
                        "Starting demo; local logs: {}",
                        plan.logs_directory.display()
                    );
                    plan.run()?;
                }
            }
            _ => unreachable!(),
        }
        Ok(())
    })();
    for event in &client.activity {
        eprintln!("Network: {} — {}", event.domain, event.purpose);
    }
    outcome
}
