#!/bin/bash
# inkpress skill entry point
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Ensure dependencies
pip install -q markdown pygments pyyaml 2>/dev/null || true

# Run inkpress CLI
cd "$SKILL_ROOT"
python -m inkpress "$@"
