#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/output/marketplace-posters-v2/backgrounds"
SCRIPT="${CODEX_HOME:-$HOME/.codex}/skills/openai-imagegen-proxy/scripts/generate_image.py"

mkdir -p "$OUT"

python3 "$SCRIPT" \
  --prompt "Premium abstract background for a browser productivity extension marketplace poster, warm off-white handmade paper, extremely subtle rice paper fiber texture, faint mineral pigment wash in muted sage green and old gold, restrained Chinese ink painting atmosphere, large negative space on the left, very soft depth, editorial product photography backdrop, no text, no UI, no devices, no logos, no people, no mountains drawn literally, no purple gradient." \
  --output "$OUT/01-calm-paper.png"

python3 "$SCRIPT" \
  --prompt "Premium dark abstract background for a browser extension marketplace poster, deep black-green ink wash on textured paper, quiet modern luxury, subtle blue mineral pigment glow on the right, restrained grain, elegant negative space, high-end editorial technology backdrop, no text, no UI, no devices, no logos, no people, no neon cyberpunk, no purple gradient." \
  --output "$OUT/02-ink-night.png"

python3 "$SCRIPT" \
  --prompt "Premium abstract split background showing light mode and dark mode contrast, left half warm white rice paper with muted sage pigment, right half deep black-green ink paper with a restrained blue accent, smooth vertical transition at center, subtle paper grain, refined editorial product backdrop, no text, no UI, no devices, no logos, no people." \
  --output "$OUT/03-split-theme.png"

python3 "$SCRIPT" \
  --prompt "Premium abstract background for a calm productivity poster, off-white paper field with one precise old-gold circular mark and faint ink lines suggesting selection and cleanup, lots of negative space, understated, high-end, tactile print texture, no text, no UI, no devices, no logos, no people." \
  --output "$OUT/04-dedupe-focus.png"

python3 "$SCRIPT" \
  --prompt "Premium abstract background inspired by traditional Chinese mineral pigments, soft off-white paper, muted old gold, pale celadon, faint rouge and iris blue pigment samples diffused into paper texture, refined gallery catalog style, no text, no UI, no devices, no logos, no people, no literal landscape." \
  --output "$OUT/05-eastern-palette.png"
