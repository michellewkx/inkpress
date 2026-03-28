# inkpress Development Guide

## Project Structure

```
inkpress/                  # Python core package
  __init__.py             # Public API: convert, list_themes, etc.
  core.py                 # MarkdownConverter class
  cli.py                  # CLI entrypoint
  server.py               # FastAPI server
  renderer/
    parser.py             # Markdown preprocessor (GFM alerts, gallery, dialogue)
    engine.py             # HTML renderer + inline style injection
    theme_loader.py       # YAML theme loading with user override support
themes/                   # YAML theme files
showcase/                 # Static SPA website
scripts/                  # Build scripts
skills/inkpress/          # Skill definition for Claude Code
```

## Key Architecture

Three-stage pipeline:
1. **Preprocess** (parser.py): custom syntax → HTML placeholder tokens
2. **Parse** (python-markdown): standard Markdown → HTML
3. **Style inject** (engine.py): regex-match HTML tags → inject inline `style=""` from YAML

## Theme Development

Themes are YAML files. Copy `themes/_template.yaml` to start.
Each element maps to an inline CSS string. WeChat strips `class` and `<style>`, so everything must be inline.

## Building the Showcase

```bash
python scripts/build_themes.py  # Compiles YAML → showcase/js/themes.js
```

## Testing

```bash
cd /path/to/inkpress
python -c "from inkpress import convert; print(convert('# Test\nHello'))"
python -m inkpress themes
python -m inkpress convert test.md -t cyberpunk
```
