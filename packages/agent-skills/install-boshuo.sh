#!/usr/bin/env bash
set -euo pipefail

SKILL_ID="${SKILL_ID:-boshuo}"
BASE_URL="${BASE_URL:-https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/agent-skills}"
TARGET="${AGENT_TARGET:-both}"
SOURCE_URL="$BASE_URL/skills/$SKILL_ID/SKILL.md"

need_curl() {
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to install $SKILL_ID." >&2
    exit 1
  fi
}

install_skill() {
  local root="$1"
  local label="$2"
  local target_dir="$root/skills/$SKILL_ID"

  mkdir -p "$target_dir"
  curl -fsSL "$SOURCE_URL" -o "$target_dir/SKILL.md"
  echo "Installed $SKILL_ID for $label: $target_dir"
}

install_project_skill() {
  local root="${PROJECT_AGENTS_DIR:-.agents/skills}"
  local target_dir="$root/$SKILL_ID"

  mkdir -p "$target_dir"
  curl -fsSL "$SOURCE_URL" -o "$target_dir/SKILL.md"
  echo "Installed $SKILL_ID for project agents: $target_dir"
}

need_curl

case "$TARGET" in
  codex)
    install_skill "${CODEX_HOME:-$HOME/.codex}" "Codex"
    ;;
  cc|claude)
    install_skill "${CLAUDE_HOME:-$HOME/.claude}" "Claude Code"
    ;;
  both)
    install_skill "${CODEX_HOME:-$HOME/.codex}" "Codex"
    install_skill "${CLAUDE_HOME:-$HOME/.claude}" "Claude Code"
    ;;
  agents|project)
    install_project_skill
    ;;
  all)
    install_skill "${CODEX_HOME:-$HOME/.codex}" "Codex"
    install_skill "${CLAUDE_HOME:-$HOME/.claude}" "Claude Code"
    install_project_skill
    ;;
  *)
    echo "Unknown AGENT_TARGET=$TARGET. Use codex, cc, both, agents, project, or all." >&2
    exit 1
    ;;
esac

cat <<EOF

Done.

Use it by asking:
  让博哥说
  来点博哥味
  上点强度
  博哥锐评一下

Disable it by saying:
  关闭博哥口吻
  正常说话
  这句正常点
EOF
