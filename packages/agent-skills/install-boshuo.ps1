$ErrorActionPreference = "Stop"

$skillId = if ($env:SKILL_ID) { $env:SKILL_ID } else { "boshuo" }
$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/agent-skills" }
$target = if ($env:AGENT_TARGET) { $env:AGENT_TARGET } else { "both" }
$sourceUrl = "$baseUrl/skills/$skillId/SKILL.md"

function Install-Skill($root, $label) {
  $targetDir = Join-Path (Join-Path $root "skills") $skillId
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -OutFile (Join-Path $targetDir "SKILL.md")
  Write-Host "Installed $skillId for $label`: $targetDir"
}

function Install-ProjectSkill {
  $root = if ($env:PROJECT_AGENTS_DIR) { $env:PROJECT_AGENTS_DIR } else { ".agents\skills" }
  $targetDir = Join-Path $root $skillId
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  Invoke-WebRequest -UseBasicParsing -Uri $sourceUrl -OutFile (Join-Path $targetDir "SKILL.md")
  Write-Host "Installed $skillId for project agents: $targetDir"
}

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$claudeHome = if ($env:CLAUDE_HOME) { $env:CLAUDE_HOME } else { Join-Path $HOME ".claude" }

switch ($target) {
  "codex" { Install-Skill $codexHome "Codex" }
  "cc" { Install-Skill $claudeHome "Claude Code" }
  "claude" { Install-Skill $claudeHome "Claude Code" }
  "both" {
    Install-Skill $codexHome "Codex"
    Install-Skill $claudeHome "Claude Code"
  }
  "agents" { Install-ProjectSkill }
  "project" { Install-ProjectSkill }
  "all" {
    Install-Skill $codexHome "Codex"
    Install-Skill $claudeHome "Claude Code"
    Install-ProjectSkill
  }
  default {
    throw "Unknown AGENT_TARGET=$target. Use codex, cc, both, agents, project, or all."
  }
}

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Use it by asking: 用博哥说 / 来点博哥味 / 上点强度 / 博哥锐评一下"
Write-Host "Disable it by asking: 关闭博哥口吻 / 正常说话 / 这句正常点"
