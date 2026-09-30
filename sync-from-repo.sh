#!/usr/bin/env bash
# ============================================================================
# CAS-NGS Core Suite — sync the biotech assets from your repo.
#
# The audit (?cas-debug=1) proved the blocks are wired correctly; they just
# need the files that live only in your cas-ngs-biotech-blocks repo. This
# script copies them into the plugin and verifies the result.
#
# Usage (adjust the two paths if yours differ):
#   bash sync-from-repo.sh
# ============================================================================

set -euo pipefail

# Point these at YOUR locations.
REPO="${REPO:-/workspaces/cas-ngs-biotech-blocks}"
PLUGIN="${PLUGIN:-/home/ncge4060/Local Sites/casngs-fresh/app/public/wp-content/plugins/cas-ngs-header-footer}"

if [ ! -d "$REPO" ]; then
  echo "ERROR: repo not found at: $REPO"
  echo "Re-run with: REPO=/path/to/cas-ngs-biotech-blocks bash sync-from-repo.sh"
  exit 1
fi
if [ ! -d "$PLUGIN" ]; then
  echo "ERROR: plugin not found at: $PLUGIN"
  echo "Re-run with: PLUGIN=/path/to/cas-ngs-header-footer bash sync-from-repo.sh"
  exit 1
fi

echo "Repo   : $REPO"
echo "Plugin : $PLUGIN"
echo

# 1. The block folder + render template the plugin is missing.
cp -r "$REPO/blocks/interactive-pipeline-hero" "$PLUGIN/blocks/"
cp "$REPO/blocks/act2-bento-grid/render.php" "$PLUGIN/blocks/act2-bento-grid/"

# 2. Editor UI + styles + front engine + 3D model.
mkdir -p "$PLUGIN/assets/css" "$PLUGIN/assets/js" "$PLUGIN/assets/models"
cp "$REPO/assets/css/biotech-blocks.css"        "$PLUGIN/assets/css/"
cp "$REPO/assets/js/biotech-blocks-editor.js"   "$PLUGIN/assets/js/"
cp "$REPO/assets/js/biotech-blocks-engine.js"   "$PLUGIN/assets/js/"
cp "$REPO/assets/models/dna.glb"                "$PLUGIN/assets/models/"

echo "Copied. Verifying presence + PHP syntax..."
echo

ok=1
check() {
  if [ -e "$PLUGIN/$1" ]; then
    echo "  [present] $1"
  else
    echo "  [MISSING] $1"
    ok=0
  fi
}
check "blocks/interactive-pipeline-hero/block.json"
check "blocks/interactive-pipeline-hero/render.php"
check "blocks/act2-bento-grid/render.php"
check "assets/css/biotech-blocks.css"
check "assets/js/biotech-blocks-editor.js"
check "assets/js/biotech-blocks-engine.js"
check "assets/models/dna.glb"

echo
if command -v php >/dev/null 2>&1; then
  echo "php -l on block templates:"
  for f in "$PLUGIN"/blocks/*/render.php; do
    php -l "$f" >/dev/null 2>&1 && echo "  [ok] ${f#$PLUGIN/}" || { echo "  [SYNTAX ERROR] ${f#$PLUGIN/}"; ok=0; }
  done
  echo
fi

if [ "$ok" -eq 1 ]; then
  echo "SUCCESS: all biotech assets are in place."
  echo "Reload wp-admin and open the block inserter -> 'CAS-NGS Biotech Blocks'."
  echo "Re-run ?cas-debug=1 to confirm every block reads YES + PRESENT."
else
  echo "Some files are still missing — check the [MISSING] lines above."
  exit 1
fi
