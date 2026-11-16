#!/usr/bin/env bash
# Night Circuit - install for Claude on Linux or macOS.
# Points Claude Code at this folder so every session loads the theme.
set -euo pipefail

MOD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS="$HOME/.claude/settings.json"

[ -f "$MOD_DIR/.claude-plugin/plugin.json" ] || { echo "Run this from inside the night-circuit folder." >&2; exit 1; }
mkdir -p "$HOME/.claude"
if [ -f "$SETTINGS" ] && [ ! -f "$SETTINGS.bak-before-night-circuit" ]; then cp "$SETTINGS" "$SETTINGS.bak-before-night-circuit"; fi

MOD_DIR="$MOD_DIR" SETTINGS="$SETTINGS" python3 - <<'PY'
import json, os
path, mod = os.environ["SETTINGS"], os.environ["MOD_DIR"]
data = {}
if os.path.exists(path) and open(path).read().strip():
    data = json.load(open(path))
env = data.setdefault("env", {})
dirs = [d for d in env.get("CLAUDE_CODE_PLUGIN_DIRS", "").split(":") if d]
if mod not in dirs:
    dirs.append(mod)
env["CLAUDE_CODE_PLUGIN_DIRS"] = ":".join(dirs)
env["CLAUDE_CODE_PLUGIN_DIR_WATCH"] = "1"
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY

echo "Night Circuit installed from $MOD_DIR"
echo "Quit Claude completely and open it again to see the theme."
