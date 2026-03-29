# inkpress 排版引擎

**inkpress** 是一款开源的 Markdown 排版引擎，专为微信公众号、小红书等平台设计。零依赖、零付费，所有功能完全离线运行。

---

## 核心特性

| 功能 | 描述 | 支持 |
| :--- | :--- | :---: |
| 主题系统 | 25+ 精品主题，5 大风格系列 | ✅ |
| 零依赖 | 不依赖任何外部 API 和服务 | ✅ |
| 脚注支持 | 学术风格的引用标注 | ✅ |
| GFM 提示框 | NOTE / TIP / WARNING 等 | ✅ |
| 代码高亮 | Pygments 驱动，支持 100+ 语言 | ✅ |
| 图片说明 | 自动提取 alt 生成 figcaption | ✅ |

---

## 文本格式

Markdown 提供了丰富的文本标记语法，以下是 inkpress 支持的所有文本格式：

- **粗体文本**：用于强调关键信息
- *斜体文本*：用于术语、引用或补充说明
- ~~删除线文本~~：标记已废弃或修正的内容
- `行内代码`：用于标注函数名、变量名等

你还可以组合使用：***粗斜体*** 或 **`粗体代码`** 均可正确渲染。

---

## 列表

### 无序列表

- 经典系列 — 适用于通用场景的专业风格
- 东方系列 — 水墨、唐风等中国传统美学
    - 水墨丹青：传统毛笔质感
    - 唐风：酒红与金的宫廷美学
    - 三国风：战场与英雄的色彩
- 杂志系列 — 高端排版，适合深度长文
- 社交系列 — 小红书、薄荷等年轻化风格

### 有序列表

1. 安装：`pip install inkpress`
2. 选择主题：从 25 个精品主题中挑选
3. 转换文档：一行代码生成微信兼容 HTML
4. 粘贴发布：复制到公众号后台即可

---

## 引用

> 好的排版不是装饰，而是让内容自己说话的方式。排版即是界面——它决定了读者如何感知信息的层次、节奏和情感。
>
> — Robert Bringhurst《排版风格的要素》

---

## GFM 提示框

> [!NOTE]
> **提示**：inkpress 的所有样式均通过内联 CSS 注入，确保微信公众号完美兼容。

> [!TIP]
> **技巧**：使用 `inkpress convert input.md -t aurora` 可以快速预览不同主题效果。

> [!IMPORTANT]
> **重要**：微信公众号会过滤 `class` 属性和 `<style>` 标签，因此必须使用内联样式。

> [!WARNING]
> **警告**：嵌套列表在 python-markdown 中需要 4 空格缩进，2 空格不会被识别为嵌套。

> [!CAUTION]
> **注意**：修改主题 YAML 后，需要重新运行 `build_themes.py` 来更新 showcase 预览。

---

## 代码

### Python 示例

```python
from inkpress import convert

# 使用 aurora 主题转换 Markdown
html = convert("# Hello inkpress", theme="aurora")

# 批量转换多个文件
themes = ["default", "sakura", "mono", "bauhaus"]
for theme in themes:
    output = convert(markdown_text, theme=theme)
    with open(f"output_{theme}.html", "w") as f:
        f.write(output)
```

### JavaScript 示例

```javascript
// 浏览器端渲染（Showcase 使用）
const renderer = new InkpressRenderer(theme);
const html = renderer.render(markdownText);
document.getElementById('preview').innerHTML = html;
```

---

## 表格

### 主题系列对比

| 系列 | 主题数 | 代表主题 | 适用场景 |
| :--- | :---: | :--- | :--- |
| 经典 | 10 | 默认、极简、拿铁 | 通用文章、技术博客 |
| 东方 | 5 | 水墨、唐风、枯山水 | 文化类、诗词类内容 |
| 杂志 | 4 | 包豪斯、学院派、时尚 | 深度报道、评论 |
| 社交 | 3 | 小红书、薄荷、樱花 | 生活方式、种草笔记 |

---

## 图片

![inkpress 支持自动从 alt 文本生成图片说明](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800)

---

## 脚注

inkpress 使用三段式渲染管线[^1]，将 Markdown 转换为微信兼容的 HTML。主题系统基于 YAML 配置[^2]，所有样式通过正则匹配注入为内联 CSS。

这种设计使得主题开发变得极其简单——只需修改 YAML 文件中的 CSS 值，无需理解渲染逻辑[^3]。

---

## 分隔线

上方和下方的分隔线展示了主题的 `hr` 样式或 `hr_text` 装饰效果。

---

## 快速上手

```bash
# 安装
pip install inkpress

# 命令行转换
inkpress convert article.md -t sakura -o output.html

# 查看所有主题
inkpress themes

# 启动本地服务（API 模式）
inkpress serve --port 8000
```

访问 [GitHub 仓库](https://github.com/michellewkx/inkpress) 了解更多信息，欢迎 Star 和贡献代码。

[^1]: 预处理（parser.py）→ Markdown 解析（python-markdown）→ 样式注入（engine.py）
[^2]: 详见 `themes/` 目录下的 YAML 文件，每个文件定义一套完整的视觉风格。
[^3]: 参考 `themes/_template.yaml` 创建自定义主题。
