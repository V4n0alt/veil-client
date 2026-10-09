$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..')
try {
    # Formatting is included because the initial sandbox blocked rustfmt.
    cargo fmt --all
    if ($LASTEXITCODE -ne 0) { throw 'Rust formatting failed' }
    cargo fmt --all -- --check
    if ($LASTEXITCODE -ne 0) { throw 'Rust format check failed' }
    cargo clippy --workspace --all-targets --locked -- -D warnings
    if ($LASTEXITCODE -ne 0) { throw 'Clippy failed' }
    cargo test --workspace --locked
    if ($LASTEXITCODE -ne 0) { throw 'Rust tests failed' }
    cargo build --workspace --locked
    if ($LASTEXITCODE -ne 0) { throw 'Rust build failed' }
} finally {
    Pop-Location
}
