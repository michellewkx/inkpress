# inkpress 技术文档

> 本文档详细描述 inkpress 的转换管线、支持的 HTML 元素、主题开发指南及相关技术细节。

---

## 1. 架构概览

inkpress 采用**三阶段管线**将 Markdown 转换为微信公众号兼容的内联样式 HTML：

```
Markdown 原文
  │
  ▼
┌─────────────────────────────┐
│  阶段 1：预处理 (parser.py)   │  自定义语法 → HTML 占位符
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  阶段 2：解析 (python-markdown)│  标准 Markdown → HTML
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  阶段 3：样式注入 (engine.py)  │  正则匹配 HTML 标签 → 注入 inline style
└─────────────────────────────┘
  │
  ▼
带内联样式的完整 HTML
```

### 阶段 1：预处理 (`inkpress/renderer/parser.py`)

预处理器按以下顺序处理自定义语法，将其转换为 HTML 占位符 token：

| 顺序 | 功能 | 输入语法 | 输出 |
|------|------|---------|------|
| 1 | 删除线 | `~~text~~` | `<del>text</del>` |
| 2 | 列表前缀修复 | 列表前无空行 | 自动插入空行（确保 python-markdown 正确解析） |
| 3 | GFM 提示框 | `> [!TYPE]` | `<div data-inkpress-alert="TYPE">` 骨架 HTML |
| 4 | 图片轮播 | `:::gallery[title]...:::` | 可横向滚动的图片轮播 HTML |
| 5 | 长图模式 | `:::longimage[title]...:::` | 可纵向滚动的长图容器 HTML |
| 6 | 对话模式 | `:::dialogue[title]...:::` | 聊天气泡布局 HTML |

**GFM 提示框** 支持 5 种类型：

| 类型 | 默认标签 | 默认颜色 | 默认图标 |
|------|---------|---------|---------|
| `NOTE` | 提示 | `#1677ff` | 📌 |
| `TIP` | 技巧 | `#52c41a` | 💡 |
| `IMPORTANT` | 重要 | `#fa8c16` | ⚠️ |
| `WARNING` | 警告 | `#f5222d` | 🔔 |
| `CAUTION` | 注意 | `#a0d911` | ⚡ |

**占位符机制**：预处理器为每段自定义 HTML 生成唯一键（`INKPRESS_HTML_BLOCK_0`, `INKPRESS_HTML_BLOCK_1`, ...），在阶段 2 完成后，引擎将占位符替换回真实 HTML。

### 阶段 2：解析 (`python-markdown`)

使用 python-markdown 标准库及以下扩展：

| 扩展 | 用途 |
|------|------|
| `tables` | 表格语法支持 |
| `fenced_code` | 围栏代码块 |
| `codehilite` | 代码语法高亮（使用 Pygments，noclasses=True） |
| `toc` | 目录生成 |
| `attr_list` | 属性列表 |
| `md_in_html` | HTML 块内的 Markdown |
| `extra` | 脚注等额外功能 |

### 阶段 3：样式注入 (`inkpress/renderer/engine.py`)

`InkpressRenderer` 类通过正则匹配 HTML 标签，从 YAML 主题配置中读取样式值，注入为 `style=""` 属性。这是因为微信公众号编辑器会剥离 `class` 属性和 `<style>` 标签，所有样式必须内联。

---

## 2. 支持的所有 HTML 元素

以下表格列出 inkpress 可定制样式的所有元素及其 YAML 配置路径。

### 2.1 标题（h1 - h6）

**YAML 键**：`h1` 至 `h6`

| 子键 | 说明 |
|------|------|
| `style` | 标题的完整内联 CSS |

装饰键（位于 `decorations` 下）：`h1_prefix` 至 `h6_prefix`，在标题文字前插入装饰文本。

```yaml
h2:
  style: |
    margin: 2em 8px 0.75em;
    padding: 0px 0px 0.5em 14px;
    border-left: 4px solid #3498db;
    font-size: 20px;
    font-weight: 700;
    color: #2c3e50;

decorations:
  h2_prefix: "✦ "
```

### 2.2 段落（paragraph）

**YAML 键**：`paragraph`

| 子键 | 说明 |
|------|------|
| `style` | 段落 `<p>` 标签的内联 CSS |

```yaml
paragraph:
  style: |
    margin: 1.2em 8px;
    color: #2c3e50;
    font-family: 'PingFang SC', -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.75;
    letter-spacing: 0.1em;
```

> 注意：段落样式中的 `font-family`、`color`、`line-height`、`font-size` 会被提取并应用到外层容器，作为全局默认值。

### 2.3 列表（list）

**YAML 键**：`list`

| 子键 | 说明 |
|------|------|
| `container_style` | `<ul>` / `<ol>` 容器样式 |
| `item_style` | `<li>` 项目样式 |
| `ul_prefix` | 无序列表前缀，默认 `"• "` |
| `ol_prefix` | 有序列表前缀，`{n}` 会被替换为序号，默认 `"{n}. "` |
| `nested_container_style` | 嵌套列表容器样式 |
| `nested_item_style` | 嵌套列表项目样式（未设置时继承 `item_style`） |
| `nested_ul_prefix` | 嵌套无序列表前缀，默认 `"◦ "` |

```yaml
list:
  container_style: |
    list-style: none;
    padding: 0;
    margin: 1.2em 8px;
  item_style: |
    margin: 0.5em 0;
    line-height: 1.75;
  ul_prefix: "• "
  ol_prefix: "{n}. "
  nested_container_style: |
    list-style: none;
    padding: 0 0 0 1.5em;
  nested_ul_prefix: "◦ "
```

### 2.4 代码块（code_block）

**YAML 键**：`code_block`

| 子键 | 说明 |
|------|------|
| `style` | `<pre>` 标签样式 |
| `code_inner_style` | `<code>` 内部标签样式 |

代码块使用 Pygments 进行语法高亮（`github` 主题，`noclasses=True`），高亮样式以内联方式输出。

```yaml
code_block:
  style: |
    margin: 1.5em 8px;
    padding: 1.2em;
    background-color: #f8f9fa;
    border-top: 3px solid #3498db;
    border-radius: 6px;
    overflow-x: auto;
  code_inner_style: |
    background: none;
    padding: 0;
    font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
    font-size: 14px;
```

### 2.5 内联代码（inline_code）

**YAML 键**：`inline_code`

| 子键 | 说明 |
|------|------|
| `style` | 行内 `<code>` 标签样式（不含已有 style 的代码块内 code） |

```yaml
inline_code:
  style: |
    font-size: 90%;
    color: #3498db;
    background-color: rgba(52, 152, 219, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
```

> 注意：引擎按 code_block → inline_code 的顺序处理。代码块内的 `<code>` 在 `_style_code_blocks` 中已注入 `code_inner_style`，`_style_inline_code` 不会重复注入（通过 `(?![^>]*style=)` 前瞻断言避免）。

### 2.6 引用（blockquote）

**YAML 键**：`blockquote`

| 子键 | 说明 |
|------|------|
| `style` | `<blockquote>` 标签样式 |
| `p_inner_style` | 引用内 `<p>` 标签样式 |

装饰键（位于 `decorations` 下）：

| 装饰键 | 说明 |
|--------|------|
| `blockquote_prefix` | 引用段落前缀文本 |
| `blockquote_suffix` | 引用段落后缀文本 |

```yaml
blockquote:
  style: |
    margin: 1.5em 8px;
    padding: 1em 1em 1em 1.5em;
    border-left: 4px solid #3498db;
    background-color: #f0f4f8;
  p_inner_style: |
    margin: 0;
    color: #5d6d7e;

decorations:
  blockquote_prefix: "「"
  blockquote_suffix: "」"
```

### 2.7 脚注（footnote）

**YAML 键**：`footnote`

| 子键 | 说明 |
|------|------|
| `sup_style` | `<sup>` 上标样式 |
| `ref_style` | 脚注引用链接 `<a>` 样式，数字自动添加方括号（如 `1` → `[1]`） |
| `section_style` | 脚注区域 `<section>` 样式 |
| `list_style` | 脚注列表 `<ol>` 样式 |
| `item_style` | 脚注条目 `<li>` 样式 |
| `backref_style` | 回引链接 `<a class="footnote-backref">` 样式 |

```yaml
footnote:
  sup_style: |
    font-size: 0.75em;
    vertical-align: super;
  ref_style: |
    color: inherit;
    text-decoration: none;
    border-bottom: 1px dashed #3498db;
  section_style: |
    margin-top: 2.5em;
    padding-top: 1.8em;
    border-top: 1px solid #d5e8f5;
  list_style: |
    list-style-type: decimal;
    padding-left: 1.5em;
  item_style: |
    font-size: 0.85em;
    color: #95a5a6;
  backref_style: |
    color: #3498db;
    text-decoration: none;
```

### 2.8 GFM 提示框（gfm_alert）

**YAML 键**：`gfm_alert`

| 子键 | 说明 |
|------|------|
| `container_style` | 提示框容器基础样式（引擎会自动追加 `border-left` 和 `background`） |
| `title_style` | 标题行基础样式（引擎会自动追加 `color`） |
| `content_style` | 内容区域样式 |
| `note_color` | NOTE 类型颜色 |
| `tip_color` | TIP 类型颜色 |
| `important_color` | IMPORTANT 类型颜色 |
| `warning_color` | WARNING 类型颜色 |
| `caution_color` | CAUTION 类型颜色 |

每种类型的实际渲染效果：容器左边框 4px solid + 5% 透明度背景色，标题颜色与类型颜色一致。

```yaml
gfm_alert:
  container_style: |
    margin: 1.5em 8px;
    padding: 12px 16px;
    border-radius: 4px;
  title_style: |
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  content_style: |
    color: #2c3e50;
    line-height: 1.6;
  note_color: "#3498db"
  tip_color: "#27ae60"
  important_color: "#f39c12"
  warning_color: "#e74c3c"
  caution_color: "#e67e22"
```

### 2.9 链接（link）

**YAML 键**：`link`

| 子键 | 说明 |
|------|------|
| `style` | `<a>` 标签样式 |

```yaml
link:
  style: |
    color: #3498db;
    text-decoration: none;
    border-bottom: 1px solid rgba(52, 152, 219, 0.3);
```

### 2.10 图片（image）

**YAML 键**：`image`

| 子键 | 说明 |
|------|------|
| `container_style` | 外层 `<figure>` 容器样式（设置后 `<p>` 会被替换为 `<figure>`） |
| `img_style` | `<img>` 标签样式 |
| `caption_style` | `<figcaption>` 说明文字样式（仅在图片有 alt 文本时生成） |

```yaml
image:
  container_style: |
    margin: 1.5em 0;
    text-align: center;
  img_style: |
    max-width: 100%;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
  caption_style: |
    text-align: center;
    font-size: 0.85em;
    color: #7f8c8d;
```

### 2.11 表格（table）

**YAML 键**：`table`

| 子键 | 说明 |
|------|------|
| `style` | `<table>` 标签样式 |
| `th_style` | `<th>` 表头单元格样式 |
| `td_style` | `<td>` 数据单元格样式 |
| `tr_odd_style` | 奇数行（0-indexed: 第 0、2、4 行）附加样式，追加到该行 `<td>` 的 style 末尾 |
| `wrapper_style` | 外层 `<div>` 包裹样式（用于 overflow 处理） |

```yaml
table:
  wrapper_style: |
    overflow-x: auto;
    margin: 1.5em 8px;
  style: |
    width: 100%;
    border-collapse: collapse;
  th_style: |
    padding: 10px 14px;
    font-weight: 700;
    color: #ffffff;
    background-color: #3498db;
    border: 1px solid #2e86c1;
  td_style: |
    padding: 8px 14px;
    border: 1px solid #d5dbdb;
  tr_odd_style: |
    background: rgba(52, 152, 219, 0.04);
```

### 2.12 分隔线（hr）

**YAML 键**：`hr`

| 子键 | 说明 |
|------|------|
| `style` | `<hr>` 标签样式 |

装饰键（位于 `decorations` 下）：

| 装饰键 | 说明 |
|--------|------|
| `hr_text` | 替换 `<hr>` 为居中装饰文本（设置后 `style` 被忽略） |

```yaml
hr:
  style: |
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, #3498db, transparent);

# 或使用装饰文本：
decorations:
  hr_text: "- * -"
```

### 2.13 强调样式（bold / italic / strikethrough）

**YAML 键**：`bold`、`italic`、`strikethrough`

| 元素 | 影响标签 | 子键 |
|------|---------|------|
| `bold` | `<strong>`, `<b>` | `style` |
| `italic` | `<em>`, `<i>` | `style` |
| `strikethrough` | `<del>`, `<s>`, `<strike>` | `style` |

```yaml
bold:
  style: |
    font-weight: 700;
    color: #2980b9;

italic:
  style: |
    font-style: italic;
    color: #5d6d7e;

strikethrough:
  style: |
    text-decoration: line-through;
    color: #95a5a6;
```

### 2.14 对话（dialogue）

**YAML 键**：`dialogue`

| 子键 | 说明 |
|------|------|
| `container_style` | 对话框外层容器样式 |
| `title_style` | 对话标题样式 |
| `bubble_left_style` | 左侧（奇数序号）气泡样式 |
| `bubble_right_style` | 右侧（偶数序号）气泡样式 |
| `avatar_style` | 头像通用样式 |
| `avatar_left_style` | 左侧头像样式（背景色、文字颜色） |
| `avatar_right_style` | 右侧头像样式（背景色、文字颜色） |

```yaml
dialogue:
  container_style: |
    margin: 2em 0;
    padding: 18px;
    background-color: #f0f4f8;
    border-radius: 10px;
  title_style: |
    font-size: 17px;
    font-weight: 700;
    color: #2c3e50;
    text-align: center;
  bubble_left_style: |
    background-color: #ffffff;
    color: #2c3e50;
    border-radius: 10px;
    border: 1px solid #d5dbdb;
  bubble_right_style: |
    background-color: #3498db;
    color: #ffffff;
    border-radius: 10px;
  avatar_style: |
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-weight: 700;
  avatar_left_style: |
    background-color: #d5dbdb;
    color: #2c3e50;
  avatar_right_style: |
    background-color: #3498db;
    color: #ffffff;
```

### 2.15 容器（container）

**YAML 键**：`container`

| 子键 | 说明 | 默认值 |
|------|------|--------|
| `max_width` | 内容区最大宽度 | `"677px"` |
| `padding` | 内边距 | `"8px"` |
| `background` | 背景色 | `"#ffffff"` |
| `border_radius` | 圆角 | `"12px"` |
| `box_shadow` | 阴影 | `""` |
| `border` | 边框 | - |

```yaml
container:
  max_width: "677px"
  padding: "16px"
  background: "#ffffff"
  border_radius: "12px"
  box_shadow: "0 2px 12px rgba(44, 62, 80, 0.08)"
```

### 2.16 页面背景（body）

**YAML 键**：`body`

| 子键 | 说明 | 默认值 |
|------|------|--------|
| `background` | 页面背景色 | `"#f9f9f9"` |
| `padding` | 页面内边距 | `"16px"` |
| `margin` | 页面外边距 | `"0"` |

```yaml
body:
  background: "#eef2f7"
  padding: "16px"
  margin: "0"
```

### 2.17 装饰（decorations）

**YAML 键**：`decorations`

| 子键 | 说明 |
|------|------|
| `h1_prefix` ~ `h6_prefix` | 标题前缀装饰文本 |
| `hr_text` | 分隔线替换文本 |
| `blockquote_prefix` | 引用段落前缀 |
| `blockquote_suffix` | 引用段落后缀 |

```yaml
decorations:
  h2_prefix: "✦ "
  hr_text: "- * -"
  blockquote_prefix: "「"
  blockquote_suffix: "」"
```

---

## 3. 主题开发指南

### 3.1 核心约束

微信公众号编辑器会**剥离所有 `class` 属性和 `<style>` 标签**。因此 inkpress 的所有样式必须以内联 `style=""` 的方式注入到每个 HTML 标签上。这是整个主题系统的设计基础。

### 3.2 YAML 文件结构

一个完整的主题 YAML 文件包含以下顶层键：

```yaml
# 元信息
name: "主题显示名"
description: "主题描述"
series: "系列名"      # 用于分组，如 classic、modern
tags: ["标签1", "标签2"]

# 布局
container: { ... }
body: { ... }

# 元素样式
h1: { style: "..." }
h2: { style: "..." }
# ... h3-h6
paragraph: { style: "..." }
list: { ... }
code_block: { ... }
inline_code: { style: "..." }
blockquote: { ... }
footnote: { ... }
gfm_alert: { ... }
link: { style: "..." }
image: { ... }
table: { ... }
hr: { style: "..." }
bold: { style: "..." }
italic: { style: "..." }
strikethrough: { style: "..." }
dialogue: { ... }

# 装饰
decorations: { ... }
```

### 3.3 创建新主题

1. **复制默认主题**作为起点：
   ```bash
   cp themes/default.yaml themes/mytheme.yaml
   ```

2. **修改元信息**：
   ```yaml
   name: "我的主题"
   description: "自定义主题描述"
   series: "custom"
   tags: ["自定义"]
   ```

3. **调整样式值**：修改各元素的 CSS 属性值。

4. **测试主题**：
   ```bash
   python -m inkpress convert test.md -t mytheme
   ```

### 3.4 用户自定义主题目录

除了项目内的 `themes/` 目录，inkpress 还支持用户级主题目录：

```
~/.inkpress/themes/
```

用户目录中的主题**优先级高于**内置主题，同名主题会覆盖内置版本。

### 3.5 颜色定制技巧

- **配色一致性**：建议选定一个主色后，标题边框、链接、代码高亮、引用边框等均使用该主色或其变体。
- **对比度**：正文颜色与背景色需保持足够对比度（建议 WCAG AA 标准以上）。
- **透明度技巧**：使用 `rgba()` 为背景和边框创建轻量色彩，如 `rgba(52, 152, 219, 0.1)` 。
- **渐变**：分隔线和标题背景支持 CSS 渐变，如 `linear-gradient(135deg, #007aff, #5856d6)`。

### 3.6 style 值书写规范

YAML 中的 `style` 值使用多行字符串（`|`）书写，每行一条 CSS 属性，以分号结尾：

```yaml
h1:
  style: |
    margin: 1.8em 8px 1em;
    padding: 0.9em 1.6em;
    font-size: 22px;
    color: #ffffff;
    background: #2c3e50;
```

引擎会将多行合并为单行 inline style 注入到标签中。

---

## 4. 渲染顺序

`_apply_styles` 方法按以下固定顺序对 HTML 应用样式。当多个规则可能作用于同一标签时，后执行的规则会覆盖先执行的（取决于正则是否匹配已有 style 属性）。

| 顺序 | 方法 | 处理元素 |
|------|------|---------|
| 1 | `_style_headings` | h1 - h6 |
| 2 | `_style_paragraphs` | `<p>` |
| 3 | `_style_lists` | `<ul>`, `<ol>`, `<li>` |
| 4 | `_style_code_blocks` | `<pre>`, `<code>`（代码块内） |
| 5 | `_style_inline_code` | `<code>`（行内，跳过已有 style 的） |
| 6 | `_style_blockquotes` | `<blockquote>` |
| 7 | `_style_footnotes` | `<sup>`, `<a>` 脚注相关 |
| 8 | `_style_gfm_alerts` | `<div data-inkpress-alert>` |
| 9 | `_style_links` | `<a>`（跳过已有 style 的） |
| 10 | `_style_images` | `<img>`, `<figure>`, `<figcaption>` |
| 11 | `_style_tables` | `<table>`, `<th>`, `<td>`, `<tbody>` |
| 12 | `_style_hr` | `<hr>` |
| 13 | `_style_emphasis` | `<strong>`, `<b>`, `<em>`, `<i>`, `<del>`, `<s>` |
| 14 | `_style_dialogue` | `.dialogue-*` 系列 section |

大部分样式注入方法使用 `(?![^>]*style=)` 负前瞻，确保不会对已有内联样式的标签重复注入。因此顺序主要影响：

- **code_block vs inline_code**：代码块内的 `<code>` 在步骤 4 注入 `code_inner_style` 后，步骤 5 不会再覆盖。
- **footnote vs link**：脚注引用链接在步骤 7 注入样式后，步骤 9 的通用链接样式不会覆盖它。

---

## 5. JS Renderer 同步

`showcase/js/renderer.js` 是 Python 引擎 `engine.py` 的 JavaScript 镜像实现，用于 Showcase 网站的浏览器端实时预览。

### 同步要求

当 `inkpress/renderer/engine.py` 发生以下变更时，必须同步更新 `showcase/js/renderer.js`：

- 新增元素的样式注入逻辑
- 修改正则匹配模式
- 调整渲染顺序
- 变更 HTML 结构或包裹方式
- 新增/修改装饰（decorations）处理

### 构建流程

主题数据通过构建脚本编译为 JS 可用格式：

```bash
python scripts/build_themes.py  # 编译 YAML → showcase/js/themes.js
```

修改主题 YAML 文件后需重新执行此命令，Showcase 才能使用最新的主题配置。

### 验证方法

修改引擎后，建议同时在 Python 和浏览器端验证渲染结果一致：

```bash
# Python 端
python -m inkpress convert test.md -t default

# 浏览器端
python scripts/build_themes.py
# 打开 showcase/index.html 预览
```
