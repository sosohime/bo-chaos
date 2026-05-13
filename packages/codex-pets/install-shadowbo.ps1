$ErrorActionPreference = "Stop"

$petId = if ($env:PET_ID) { $env:PET_ID } else { "shadowbo" }
$codexHome = if ($env:CODEX_HOME) {
  $env:CODEX_HOME
} elseif ($env:USERPROFILE) {
  Join-Path $env:USERPROFILE ".codex"
} else {
  Join-Path $HOME ".codex"
}
$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets" }
$targetDir = Join-Path (Join-Path $codexHome "pets") $petId

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/pets/$petId/pet.json" -OutFile (Join-Path $targetDir "pet.json")
Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/pets/$petId/spritesheet.png" -OutFile (Join-Path $targetDir "spritesheet.png")

Write-Host "Installed 影流Bo Codex pet to: $targetDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open Codex Settings -> Appearance -> Pets."
Write-Host "2. Click Refresh."
Write-Host "3. Select 影流Bo (custom:shadowbo)."
Write-Host "4. If the overlay does not update, toggle Wake Pet off and on."
