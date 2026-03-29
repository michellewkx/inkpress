/**
 * inkpress showcase — app.js
 * i18n + theme gallery + fullscreen editor + preview modal
 */

// ============ i18n ============
const I18N = {
  zh: {
    'nav.showcase': 'Showcase',
    'nav.themes': '主题',
    'nav.editor': '编辑器',
    'nav.install': '安装',
    'hero.chip': '为创作者打造的排版引擎',
    'hero.title': '让排版<br><span class="shimmer">不再将就</span>',
    'hero.desc': '为创作者打造的排版引擎<br>微信公众号 · 小红书 · 更多平台',
    'hero.start': '开始使用',
    'hero.browse': '浏览主题 →',
    'stats.themes': '精品主题',
    'stats.series': '风格系列',
    'stats.deps': '外部依赖',
    'stats.platforms': '平台支持',
    'gallery.title': '主题画廊',
    'gallery.all': '全部',
    'gallery.classic': '经典',
    'gallery.oriental': '东方',
    'gallery.magazine': '杂志',
    'gallery.social': '社交',
    'gallery.preview': '在线编辑',
    'install.title': '快速开始',
    'install.desc': '通过 pip 安装，秒级启动',
    'editor.title': '在线编辑器',
    'editor.copy': '复制 HTML',
    'editor.download': '下载',
    'editor.copyRich': '复制到微信',
    'editor.input': 'MARKDOWN 输入',
    'editor.preview': '实时预览',
    'toast.copied': '已复制到剪贴板',
    'toast.copiedText': '已复制 HTML 文本',
    'toast.pipCopied': '已复制安装命令',
    'lang.toggle': 'EN',
  },
  en: {
    'nav.showcase': 'Showcase',
    'nav.themes': 'Themes',
    'nav.editor': 'Editor',
    'nav.install': 'Install',
    'hero.chip': 'Typography Engine for Creators',
    'hero.title': 'Typography<br><span class="shimmer">Perfected</span>',
    'hero.desc': 'A typography engine built for creators<br>WeChat · Xiaohongshu · More platforms',
    'hero.start': 'Get Started',
    'hero.browse': 'Browse Themes →',
    'stats.themes': 'themes',
    'stats.series': 'series',
    'stats.deps': 'deps',
    'stats.platforms': 'platforms',
    'gallery.title': 'Themes',
    'gallery.all': 'All',
    'gallery.classic': 'Classic',
    'gallery.oriental': 'Oriental',
    'gallery.magazine': 'Magazine',
    'gallery.social': 'Social',
    'gallery.preview': 'Open Editor',
    'install.title': 'Quick Start',
    'install.desc': 'Install via pip, start in seconds',
    'editor.title': 'Editor',
    'editor.copy': 'Copy HTML',
    'editor.download': 'Download',
    'editor.copyRich': 'Copy for WeChat',
    'editor.input': 'MARKDOWN',
    'editor.preview': 'PREVIEW',
    'toast.copied': 'Copied to clipboard',
    'toast.copiedText': 'HTML text copied',
    'toast.pipCopied': 'Install command copied',
    'lang.toggle': '中文',
  }
};

let currentLang = 'zh';

function t(key) {
  return I18N[currentLang][key] || I18N.en[key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.getElementById('langToggle').textContent = t('lang.toggle');
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  renderTabs();
  renderGallery();
}

function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  applyI18n();
}

// ============ Theme data ============
const SERIES_ORDER = ['classic', 'oriental', 'magazine', 'social'];

const SAMPLE_MD = `# inkpress 排版引擎

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
| 图片画廊 | 多图横向滑动展示 | ✅ |
| 对话功能 | 聊天气泡风格的问答展示 | ✅ |

---

## 文本格式

Markdown 提供了丰富的文本标记语法，以下是 inkpress 支持的所有文本格式：

- **粗体文本**：用于强调关键信息
- *斜体文本*：用于术语、引用或补充说明
- ~~删除线文本~~：标记已废弃或修正的内容
- \`行内代码\`：用于标注函数名、变量名等

你还可以组合使用：***粗斜体*** 或 **\`粗体代码\`** 均可正确渲染。

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

1. 安装：\`pip install inkpress\`
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
> **技巧**：使用 \`inkpress convert input.md -t aurora\` 可以快速预览不同主题效果。

> [!IMPORTANT]
> **重要**：微信公众号会过滤 \`class\` 属性和 \`<style>\` 标签，因此必须使用内联样式。

> [!WARNING]
> **警告**：嵌套列表在 python-markdown 中需要 4 空格缩进，2 空格不会被识别为嵌套。

> [!CAUTION]
> **注意**：修改主题 YAML 后，需要重新运行 \`build_themes.py\` 来更新 showcase 预览。

---

## 代码

### Python 示例

\`\`\`python
from inkpress import convert

# 使用 aurora 主题转换 Markdown
html = convert("# Hello inkpress", theme="aurora")

# 批量转换多个文件
themes = ["default", "sakura", "mono", "bauhaus"]
for theme in themes:
    output = convert(markdown_text, theme=theme)
    with open(f"output_{theme}.html", "w") as f:
        f.write(output)
\`\`\`

### JavaScript 示例

\`\`\`javascript
// 浏览器端渲染（Showcase 使用）
const renderer = new InkpressRenderer(theme);
const html = renderer.render(markdownText);
document.getElementById('preview').innerHTML = html;
\`\`\`

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

## 图片画廊

:::gallery[inkpress 主题效果展示]
![经典主题](https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600)
![东方水墨](https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600)
![杂志风格](https://images.unsplash.com/photo-1504711331083-9c895941bf81?w=600)
:::

---

## 长图展示

:::longimage[inkpress 渲染流程示意]
![系统架构全景图](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200)
:::

---

## 对话功能

:::dialogue[inkpress 技术问答]
用户: inkpress 支持哪些平台？
技术支持: 目前支持微信公众号、小红书等主流内容平台，所有样式通过内联 CSS 注入，无需额外适配。
用户: 如何自定义主题？
技术支持: 只需复制 \`themes/_template.yaml\`，修改其中的 CSS 值即可。所有元素都可以独立配置样式。
用户: 输出的内容可以直接复制到微信公众号吗？
技术支持: 完全可以！使用编辑器的「复制到微信」按钮，直接粘贴到公众号后台即可发布。
:::

---

## 脚注

inkpress 使用三段式渲染管线[^1]，将 Markdown 转换为微信兼容的 HTML。主题系统基于 YAML 配置[^2]，所有样式通过正则匹配注入为内联 CSS。

这种设计使得主题开发变得极其简单——只需修改 YAML 文件中的 CSS 值，无需理解渲染逻辑[^3]。

---

## 分隔线

上方和下方的分隔线展示了主题的 \`hr\` 样式或 \`hr_text\` 装饰效果。

---

## 快速上手

\`\`\`bash
# 安装
pip install inkpress

# 命令行转换
inkpress convert article.md -t sakura -o output.html

# 查看所有主题
inkpress themes

# 启动本地服务（API 模式）
inkpress serve --port 8000
\`\`\`

访问 [GitHub 仓库](https://github.com/michellewkx/inkpress) 了解更多信息，欢迎 Star 和贡献代码。

[^1]: 预处理（parser.py）→ Markdown 解析（python-markdown）→ 样式注入（engine.py）
[^2]: 详见 \`themes/\` 目录下的 YAML 文件，每个文件定义一套完整的视觉风格。
[^3]: 参考 \`themes/_template.yaml\` 创建自定义主题。
`;

let currentTheme = 'default';
let currentFilter = 'all';

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THEMES === 'undefined') {
    console.warn('themes.js not loaded');
    return;
  }

  initSpotlight();
  initTabs();
  initGallery();
  initEditor();
  initInstall();
  initKeyboard();
  applyI18n();

  document.getElementById('langToggle').addEventListener('click', toggleLang);
  document.getElementById('heroStartBtn').addEventListener('click', openEditor);
  document.getElementById('heroBrowseBtn').addEventListener('click', () => {
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
  });
});

// ============ Spotlight ============
function initSpotlight() {
  const sp = document.getElementById('sp');
  document.addEventListener('mousemove', e => {
    sp.style.left = e.clientX + 'px';
    sp.style.top = e.clientY + 'px';
  });
}

// ============ Tabs ============
function initTabs() {
  renderTabs();
  document.getElementById('tabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('#tabs .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.series;
    renderGallery();
  });
}

function renderTabs() {
  const tabs = document.getElementById('tabs');
  const existing = new Set();
  for (const theme of Object.values(THEMES)) {
    if (theme.series) existing.add(theme.series);
  }
  let html = `<button class="tab ${currentFilter === 'all' ? 'active' : ''}" data-series="all">${t('gallery.all')}</button>`;
  for (const s of SERIES_ORDER) {
    if (existing.has(s)) {
      html += `<button class="tab ${currentFilter === s ? 'active' : ''}" data-series="${s}">${t('gallery.' + s)}</button>`;
    }
  }
  tabs.innerHTML = html;
}

// ============ Gallery ============
function initGallery() {
  renderGallery();
  // Keyboard support for cards — Enter/Space opens editor
  document.getElementById('themeGrid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.card');
      if (card) {
        e.preventDefault();
        openEditorWithTheme(card.dataset.theme);
      }
    }
  });
}

function renderGallery() {
  const grid = document.getElementById('themeGrid');
  const entries = Object.entries(THEMES);
  let visibleCount = 0;
  let html = '';

  for (const [name, theme] of entries) {
    const series = theme.series || 'other';
    if (currentFilter !== 'all' && series !== currentFilter) continue;
    visibleCount++;

    const previewHtml = generateCardPreview(theme);
    const bgColor = theme.body?.background || theme.container?.background || '#f9f9f9';

    html += `
      <div class="card card-anim" data-theme="${name}" style="animation-delay:${Math.min(visibleCount * 0.06, 0.5)}s" onclick="openEditorWithTheme('${name}')" tabindex="0" role="button" aria-label="${theme.name || name}">
        <div class="card-body">
          <div class="card-prev" style="background:${bgColor}">
            <div class="card-prev-in" style="background:${theme.container?.background || '#fff'};${theme.container?.border ? 'border:' + theme.container.border + ';' : ''}${theme.container?.border_radius ? 'border-radius:' + theme.container.border_radius + ';' : 'border-radius:8px;'}">
              ${previewHtml}
            </div>
            <div class="card-ov">
              <span class="card-ov-label">${t('gallery.preview')} <span class="arr">→</span></span>
            </div>
          </div>
          <div class="card-info">
            <div>
              <div class="card-name">${theme.name || name}</div>
              <div class="card-desc">${theme.description || ''}</div>
            </div>
            <span class="card-tag card-tag-${series}">${series}</span>
          </div>
        </div>
      </div>`;
  }

  grid.innerHTML = html || '<p style="color:var(--text-3);text-align:center;padding:40px;">No themes found.</p>';
  document.getElementById('themeCount').textContent = visibleCount;
}

function generateCardPreview(theme) {
  const renderer = new InkpressRenderer(theme);
  const miniMd = `## 标题示例\n\n这是正文内容，展示**主题效果**和*样式特点*。\n\n> 引用文本在这里\n\n- 列表项一\n- 列表项二`;
  return renderer.render(miniMd);
}

// ============ Editor ============
function initEditor() {
  const input = document.getElementById('mdInput');
  const select = document.getElementById('editorThemeSelect');

  input.value = SAMPLE_MD;

  // Populate theme select
  let html = '';
  for (const [name, theme] of Object.entries(THEMES)) {
    html += `<option value="${name}" ${name === currentTheme ? 'selected' : ''}>${theme.name || name}</option>`;
  }
  select.innerHTML = html;

  select.addEventListener('change', () => {
    currentTheme = select.value;
    renderEditorPreview();
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderEditorPreview, 150);
  });

  // Sync scroll between editor input and preview
  const previewPane = document.querySelector('.editor-preview-pane .preview-content');
  let syncScrolling = false;

  input.addEventListener('scroll', () => {
    if (syncScrolling) return;
    syncScrolling = true;
    const pct = input.scrollTop / (input.scrollHeight - input.clientHeight || 1);
    previewPane.scrollTop = pct * (previewPane.scrollHeight - previewPane.clientHeight);
    requestAnimationFrame(() => { syncScrolling = false; });
  });

  previewPane.addEventListener('scroll', () => {
    if (syncScrolling) return;
    syncScrolling = true;
    const pct = previewPane.scrollTop / (previewPane.scrollHeight - previewPane.clientHeight || 1);
    input.scrollTop = pct * (input.scrollHeight - input.clientHeight);
    requestAnimationFrame(() => { syncScrolling = false; });
  });

  document.getElementById('openEditorBtn').addEventListener('click', openEditor);
  document.getElementById('editorCloseBtn').addEventListener('click', closeEditor);
  document.getElementById('editorCopyBtn').addEventListener('click', copyHTMLText);
  document.getElementById('editorDownloadBtn').addEventListener('click', downloadHTML);
  document.getElementById('editorCopyRichBtn').addEventListener('click', copyHTMLRich);

  // Close on backdrop click
  document.getElementById('editorOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEditor();
  });
}

function openEditorWithTheme(name) {
  const theme = THEMES[name];
  if (!theme) return;
  currentTheme = name;
  document.getElementById('editorThemeSelect').value = name;
  openEditor();
}

function openEditor() {
  const overlay = document.getElementById('editorOverlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('open'));
  document.body.style.overflow = 'hidden';
  renderEditorPreview();
}

function closeEditor() {
  const overlay = document.getElementById('editorOverlay');
  overlay.classList.remove('open');
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function renderEditorPreview() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return;
  const renderer = new InkpressRenderer(theme);
  document.getElementById('previewFrame').innerHTML = renderer.render(md);
}

function getFullHTML() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return '';
  const renderer = new InkpressRenderer(theme);
  return renderer.render(md);
}

function copyHTMLRich() {
  const html = getFullHTML();
  const blob = new Blob([html], { type: 'text/html' });
  navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => {
    showToast(t('toast.copied'));
  }).catch(() => {
    navigator.clipboard.writeText(html).then(() => {
      showToast(t('toast.copiedText'));
    });
  });
}

function copyHTMLText() {
  const html = getFullHTML();
  navigator.clipboard.writeText(html).then(() => {
    showToast(t('toast.copiedText'));
  });
}

function downloadHTML() {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>inkpress</title></head><body style="margin:0;padding:16px;background:#f5f5f5;">${getFullHTML()}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `inkpress-${currentTheme}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============ Install ============
function initInstall() {
  document.getElementById('installCopy').addEventListener('click', () => {
    navigator.clipboard.writeText('pip install inkpress').then(() => {
      showToast(t('toast.pipCopied'));
    });
  });
}

// ============ Keyboard Shortcuts ============
function initKeyboard() {
  document.addEventListener('keydown', e => {
    // Escape to close modals
    if (e.key === 'Escape') {
      if (document.getElementById('editorOverlay').classList.contains('open')) {
        closeEditor();
      }
      return;
    }

    // Don't fire shortcuts when typing in textarea/input
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.key === 't' || e.key === 'T') {
      document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'e' || e.key === 'E') {
      openEditor();
    }
  });
}

// ============ Toast ============
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}
