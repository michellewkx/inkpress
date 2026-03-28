<div align="center">

# ✒️ inkpress

**Typography engine for creators — 为创作者打造的排版引擎**

Markdown → WeChat / Xiaohongshu / More platforms

25 themes · Zero deps · Free forever

[🌐 Live Demo](http://michellewkx.com/inkpress/) · [📦 Install](#install) · [📖 Docs](#custom-themes--自定义主题)

</div>

---

## Features / 特性

- **25 curated themes** across 5 series — classic, oriental, magazine, social, and more
- **Zero dependencies** — pure Python core, no external API calls
- **Fully offline** — works anywhere, even without internet
- **WeChat optimized** — copy-paste directly into WeChat Official Account editor
- **Xiaohongshu ready** — formatted content for Xiaohongshu long posts (coming soon)
- **YAML themes** — fully customizable, create your own in minutes
- **JS renderer** — browser-based 1:1 mirror of the Python engine for live preview

---

## Install / 安装

```bash
pip install markdown pygments pyyaml
```

**CLI usage / 命令行使用：**

```bash
# Convert an article / 转换文章
python -m inkpress convert article.md -t aurora -o output.html

# List all themes / 查看所有主题
python -m inkpress themes

# Start local preview server / 启动本地预览
python -m inkpress serve
```

**Python API：**

```python
from inkpress import convert, list_themes

# One-liner / 一行搞定
html = convert("# Hello\nWorld", theme="aurora")

# Browse themes / 浏览主题
for name, desc in list_themes().items():
    print(f"{name}: {desc}")
```

---

## Theme Gallery / 主题画廊

5 series, 25 handcrafted themes — [browse them all online →](http://michellewkx.com/inkpress/)

5 大系列，25 个精品主题 — [在线预览 →](http://michellewkx.com/inkpress/)

| Series / 系列 | Themes / 主题 |
|------|------|
| **Classic / 经典** | default, minimal, mono, elegant-serif, aurora, ocean, sunset, latte, bluehl, corporate, forest, sunshine |
| **Oriental / 东方** | chinese-ink, zen-garden, tang-poetry, sanguo, inkwash |
| **Magazine / 杂志** | vogue, bauhaus, editorial, academy |
| **Social / 社交** | xiaohongshu, mint, mint-highlight, sakura |

---

## Custom Themes / 自定义主题

Drop a YAML file into `~/.inkpress/themes/` — it's that simple.

把 YAML 文件放到 `~/.inkpress/themes/` 即可。

```yaml
name: "My Theme"
description: "A custom theme"
series: "custom"

h1:
  style: |
    font-size: 24px;
    color: #333;
    font-weight: bold;

paragraph:
  style: |
    font-size: 15px;
    line-height: 1.75;
    color: #444;
```

See `themes/_template.yaml` for the full field reference.

完整字段参考见 `themes/_template.yaml`。

---

## Project Structure / 项目结构

```
inkpress/          Python core engine / Python 转换引擎
themes/            YAML theme files / YAML 主题定义
showcase/          Static showcase site (GitHub Pages) / 展示网站
skills/inkpress/   Claude Code Skill definition
scripts/           Build scripts / 构建脚本
```

---

## Use as Claude Code Skill

```bash
claude skill install /path/to/inkpress/skills/inkpress
```

Then say: "帮我用 aurora 主题排版这篇文章" / "Format this article with the aurora theme"

---

## License

MIT — free for personal and commercial use.
