# inkpress 墨印

> Markdown → 微信公众号排版，25 个精品主题，完全免费，完全离线

## 快速开始

```bash
pip install markdown pygments pyyaml

# 转换文章
python -m inkpress convert article.md -t cyberpunk -o output.html

# 查看所有主题
python -m inkpress themes

# 启动本地预览
python -m inkpress serve
```

## Python API

```python
from inkpress import convert, list_themes

# 一行搞定
html = convert("# 标题\n正文内容", theme="cyberpunk")

# 查看主题
for name, desc in list_themes().items():
    print(f"{name}: {desc}")
```

## 主题画廊

5 大系列，25 个精品主题：

| 系列 | 主题 |
|------|------|
| **经典 Classic** | default, minimal, elegant-serif, aurora, ocean, sunset, mono, latte, bluehl, corporate, forest, sunshine |
| **东方 Oriental** | chinese-ink, zen-garden, tang-poetry, sanguo, inkwash |
| **杂志 Magazine** | vogue, bauhaus, editorial, academy |
| **社交 Social** | xiaohongshu, mint, mint-highlight, sakura |

在线预览：打开 `showcase/index.html` 或运行 `python -m inkpress serve`

## 自定义主题

将 YAML 文件放到 `~/.inkpress/themes/` 即可：

```yaml
name: "我的主题"
description: "自定义主题"
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

参考 `themes/_template.yaml` 获取完整字段列表。

## 作为 Skill 使用

inkpress 可以作为 Claude Code Skill 安装：

```bash
# 安装 skill
claude skill install /path/to/inkpress/skills/inkpress
```

然后对 Claude 说「帮我用 cyberpunk 主题排版这篇文章」即可。

## 项目结构

```
inkpress/          Python 核心包（转换引擎）
themes/            YAML 主题文件
showcase/          展示网站（纯静态 SPA）
skills/inkpress/   Claude Code Skill 定义
scripts/           构建脚本
```

## License

MIT
