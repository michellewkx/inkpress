---
name: inkpress
description: Convert Markdown to WeChat Official Account HTML with beautiful themes. Supports 20+ built-in themes across 5 series (Classic, Tech, Oriental, Magazine, Social). Use when user asks to "排版", "微信排版", "format article", "格式化文章", "inkpress", "convert markdown", "主题预览", or "theme".
---

# inkpress — Markdown → WeChat HTML

## What This Skill Does

Converts Markdown files to WeChat-compatible HTML with inline CSS styling using beautiful YAML themes.

## Setup

```bash
cd {SKILL_DIR}/../..
pip install -r requirements.txt 2>/dev/null || true
```

## Commands

### Convert Markdown to HTML

```bash
cd {SKILL_DIR}/../..
python -m inkpress convert <input.md> -t <theme> -o <output.html>
```

### List Available Themes

```bash
cd {SKILL_DIR}/../..
python -m inkpress themes
```

### List Themes by Series

```bash
cd {SKILL_DIR}/../..
python -m inkpress themes --series <series_name>
```

Series: classic, tech, oriental, magazine, social

### Start Preview Server

```bash
cd {SKILL_DIR}/../..
python -m inkpress serve
```

Opens local web UI at http://localhost:8089

## Workflow

When the user asks to format/convert an article:

1. **Read** the Markdown file
2. **Ask** which theme to use (show `inkpress themes` output if needed)
3. **Convert** using the CLI or Python API:
   ```python
   import sys
   sys.path.insert(0, "{SKILL_DIR}/../..")
   from inkpress import convert
   html = convert(markdown_text, theme="cyberpunk")
   ```
4. **Save** the HTML output
5. **Tell** the user: "HTML saved to X. Copy the content of the `<section>` tag and paste into WeChat editor."

## Python API

```python
from inkpress import convert, list_themes, MarkdownConverter

# Quick convert
html = convert("# Title\nContent", theme="cyberpunk")

# List themes
themes = list_themes()

# Converter instance (for multiple conversions)
converter = MarkdownConverter(theme="chinese-ink")
html1 = converter.convert("Content 1")
converter.set_theme("terminal")
html2 = converter.convert("Content 2")
```

## Theme System

Themes are YAML files in `themes/` directory. Each theme defines inline CSS for every HTML element. Users can also place custom themes in `~/.inkpress/themes/`.

### Creating a Custom Theme

Copy `themes/_template.yaml` and modify the CSS styles. Key fields:
- `name`, `description`, `series`, `tags`
- `h1` through `h6`: heading styles
- `paragraph`: body text style
- `list`: container_style, item_style, ul_prefix, ol_prefix
- `code_block`: code block and inner styles
- `blockquote`: quote styling
- `decorations`: optional h1_prefix, h2_prefix, hr_text, etc.
