param([Parameter(Mandatory=$true)][string]$ClientJar)
$ErrorActionPreference = 'Stop'
# Only the known 1.21.1 client and an explicit list of small PNGs are read.
$expected = '30c73b1c5da787909b2f73340419fdf13b9def88'
if ((Get-FileHash -LiteralPath $ClientJar -Algorithm SHA1).Hash.ToLowerInvariant() -ne $expected) {
  throw 'Choose the official Minecraft 1.21.1 client JAR from your local cache.'
}
$destination = Join-Path $PSScriptRoot '../public/minecraft'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$items = @('diamond_sword','diamond_pickaxe','diamond','apple','ender_pearl','potion','potion_overlay','bread','map','diamond_helmet','diamond_chestplate','diamond_leggings','diamond_boots')
$blocks = @('torch','grass_block_top','grass_block_side','stone','oak_log_top','oak_log','oak_planks')
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($ClientJar)
try {
  foreach ($group in @(@{kind='item';names=$items}, @{kind='block';names=$blocks})) {
    foreach ($name in $group.names) {
      $entry = $archive.GetEntry("assets/minecraft/textures/$($group.kind)/$name.png")
      if ($null -eq $entry -or $entry.Length -gt 65536) { throw "Invalid texture: $name" }
      [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, (Join-Path $destination "$name.png"), $true)
    }
  }
} finally { $archive.Dispose() }
@'
Minecraft textures in this folder were imported from this computer's official
Minecraft 1.21.1 client for a local UI preview. Minecraft assets belong to Mojang
and Microsoft; they are not covered by Veil's MIT license. This generated folder
is excluded from Git. The importer makes no network requests or game changes.
'@ | Set-Content -Encoding utf8 (Join-Path $destination 'SOURCE.txt')
Write-Output 'Imported 20 local Minecraft textures. Run the preview build next.'
