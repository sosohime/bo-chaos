#!/usr/bin/env bash
set -euo pipefail

PET_ID="${PET_ID:-expertbo}"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
BASE_URL="${BASE_URL:-https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets}"
TARGET_DIR="$CODEX_HOME/pets/$PET_ID"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to install the Codex pet." >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
curl -fsSL "$BASE_URL/pets/$PET_ID/pet.json" -o "$TARGET_DIR/pet.json"
curl -fsSL "$BASE_URL/pets/$PET_ID/spritesheet.png" -o "$TARGET_DIR/spritesheet.png"

cat <<INSTALL_DONE
Installed ExpertBo Codex pet to: $TARGET_DIR

Next steps:
1. Open Codex Settings -> Appearance -> Pets.
2. Click Refresh.
3. Select ExpertBo (custom:expertbo).
4. If the overlay does not update, toggle Wake Pet off and on.
INSTALL_DONE
