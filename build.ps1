$ErrorActionPreference = "Stop"

& "npm" ci
& "npm" run prebuild
& "npm" run build

$compress = @{
  Path = "package-lock.json", "package.json", "dist", ".env", "ormconfig.json", "run.md", "run.ps1", "run.bat", "datacat.db"
  CompressionLevel = "Fastest"
  DestinationPath = "dist"
}

Remove-Item "dist.zip" -ErrorAction Ignore
Compress-Archive @compress