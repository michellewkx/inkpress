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
    'gallery.title': '灵感舱',
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
    'editor.watermark': '水印',
    'editor.modeArticle': '文章',
    'editor.modeCard': '卡片',
    'editor.exportCards': '导出图片',
    'editor.exporting': '导出中...',
    'toast.cardExported': '已打包导出 {n} 张图片',
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
    'gallery.title': 'Inspiration Lab',
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
    'editor.watermark': 'Watermark',
    'editor.modeArticle': 'Article',
    'editor.modeCard': 'Card',
    'editor.exportCards': 'Export Cards',
    'editor.exporting': 'Exporting...',
    'toast.cardExported': '{n} cards exported as ZIP',
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
let currentMode = 'article'; // 'article' | 'card'

const CARD_RATIOS = {
  '3:4':  { w: 450, h: 600, exportScale: 2.4 },
  '4:3':  { w: 450, h: 338, exportScale: 2.4 },
  '1:1':  { w: 450, h: 450, exportScale: 2.4 },
  '9:16': { w: 450, h: 800, exportScale: 2.4 },
};


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

  // Hash routing
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // handle initial URL
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
    history.replaceState(null, '', `#editor/${currentTheme}`);
    if (currentMode === 'card') renderCardPreview();
    else renderEditorPreview();
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      if (currentMode === 'card') renderCardPreview();
      else renderEditorPreview();
    }, 150);
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

  document.getElementById('watermarkToggle').addEventListener('change', renderEditorPreview);
  document.getElementById('editorCopyRichBtn').addEventListener('click', copyHTMLRich);

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchMode(tab.dataset.mode);
    });
  });

  // Card ratio
  document.getElementById('cardRatioSelect').addEventListener('change', () => {
    if (currentMode === 'card') renderCardPreview();
  });

  // Card export
  document.getElementById('cardExportBtn').addEventListener('click', exportCards);
}

function openEditorWithTheme(name) {
  location.hash = `editor/${name}`;
}

function openEditor() {
  location.hash = `editor/${currentTheme}`;
}

function _showEditor() {
  const overlay = document.getElementById('editorOverlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('open'));
  document.body.style.overflow = 'hidden';
  renderEditorPreview();
}

function closeEditor() {
  history.pushState(null, '', location.pathname);
  _hideEditor();
}

function _hideEditor() {
  const overlay = document.getElementById('editorOverlay');
  overlay.classList.remove('open');
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

// ============ Hash Router ============
function handleRoute() {
  const hash = location.hash.slice(1); // remove #
  if (hash.startsWith('editor')) {
    const parts = hash.split('/');
    const themeName = parts[1];
    if (themeName && THEMES[themeName]) {
      currentTheme = themeName;
      document.getElementById('editorThemeSelect').value = themeName;
    }
    _showEditor();
  } else {
    _hideEditor();
  }
}

function renderEditorPreview() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return;
  const wm = document.getElementById('watermarkToggle').checked;
  const renderer = new InkpressRenderer(theme, { watermark: wm });
  document.getElementById('previewFrame').innerHTML = renderer.render(md);
}

function getFullHTML() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return '';
  const wm = document.getElementById('watermarkToggle').checked;
  const renderer = new InkpressRenderer(theme, { watermark: wm });
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

// ============ Mode Switching ============
function switchMode(mode) {
  currentMode = mode;
  const articlePreview = document.getElementById('previewFrame');
  const cardPreview = document.getElementById('cardPreview');
  const articleBtns = ['editorCopyBtn', 'editorDownloadBtn', 'editorCopyRichBtn'];
  const cardBtns = ['cardExportBtn'];
  const wmToggle = document.querySelector('.wm-toggle');

  if (mode === 'card') {
    articlePreview.classList.remove('active');
    articlePreview.style.display = 'none';
    cardPreview.classList.add('active');
    articleBtns.forEach(id => document.getElementById(id).style.display = 'none');
    cardBtns.forEach(id => document.getElementById(id).style.display = '');
    wmToggle.style.display = 'none';
    renderCardPreview();
  } else {
    articlePreview.classList.add('active');
    articlePreview.style.display = '';
    cardPreview.classList.remove('active');
    articleBtns.forEach(id => document.getElementById(id).style.display = '');
    cardBtns.forEach(id => document.getElementById(id).style.display = 'none');
    wmToggle.style.display = '';
    renderEditorPreview();
  }
}

// ============ Card Rendering (Paged.js) ============
function getCardDimensions() {
  const ratio = document.getElementById('cardRatioSelect').value;
  return CARD_RATIOS[ratio] || CARD_RATIOS['3:4'];
}

let _cardRenderTimer = null;

function renderCardPreview() {
  clearTimeout(_cardRenderTimer);
  _cardRenderTimer = setTimeout(_doRenderCard, 800);
}

function _doRenderCard() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return;

  // Show loading state
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:40px;">Rendering cards...</p>';

  const { w, h, exportScale } = getCardDimensions();

  // Use renderer to preprocess (dialogue, footnotes, GFM alerts, gallery, etc.)
  // but don't inject inline styles — card CSS handles styling
  const renderer = new InkpressRenderer(theme, { watermark: false });
  const [processed, placeholders] = renderer.preprocessMarkdown(md);
  let content = marked.parse(processed);

  // Convert <hr> to page breaks BEFORE restoring placeholders
  // (footnote section has its own <hr> inside a placeholder that we don't want converted)
  content = content.replace(/<hr[^>]*>/g, '<div class="page-break"></div>');

  // Restore placeholders
  for (const [key, value] of Object.entries(placeholders)) {
    content = content.replace(new RegExp(`<p>\\s*${key}\\s*</p>`, 'g'), value);
    content = content.replace(key, value);
  }

  // Detect first h1 for cover page
  content = content.replace(/<h1([^>]*)>(.*?)<\/h1>/,
    '<section class="cover"><h1$1>$2</h1></section>');

  // Wrap everything after cover in content div
  const coverEnd = content.indexOf('</section>');
  if (coverEnd !== -1) {
    const afterCover = content.slice(coverEnd + 10);
    content = content.slice(0, coverEnd + 10) + '<div class="content">' + afterCover + '</div>';
  }

  // Extract global font props from theme paragraph style
  const pStyle = theme.paragraph?.style || theme.paragraph || '';
  let fontFamily = 'system-ui, sans-serif';
  let color = '#333';
  let lineHeight = '1.8';
  let fontSize = '15px';
  for (const [prop, fallback] of [['font-family', fontFamily], ['color', color], ['line-height', lineHeight], ['font-size', fontSize]]) {
    const m = pStyle.match(new RegExp(`${prop}:\\s*([^;]+)`));
    if (m) {
      if (prop === 'font-family') fontFamily = m[1].trim();
      if (prop === 'color') color = m[1].trim();
      if (prop === 'line-height') lineHeight = m[1].trim();
      if (prop === 'font-size') fontSize = m[1].trim();
    }
  }

  const containerBg = theme.container?.background || '#fff';

  // Extract heading and accent colors from theme
  const h1Style = theme.h1?.style || theme.h1 || '';
  const h2Style = theme.h2?.style || theme.h2 || '';
  let headingColor = color;
  const hcm = (h2Style || h1Style).match(/color:\s*([^;]+)/);
  if (hcm) headingColor = hcm[1].trim();

  const boldStyle = theme.bold?.style || theme.bold || '';
  let boldColor = headingColor;
  const bcm = boldStyle.match(/color:\s*([^;]+)/);
  if (bcm) boldColor = bcm[1].trim();

  const bqStyle = theme.blockquote?.style || '';
  let bqBorder = `4px solid ${headingColor}`;
  const bqm = bqStyle.match(/border-left:\s*([^;]+)/);
  if (bqm) bqBorder = bqm[1].trim();

  const codeStyle = theme.code_block?.style || '';
  let codeBg = '#f5f5f5';
  const cbm = codeStyle.match(/background[^;]*:\s*([^;]+)/);
  if (cbm) codeBg = cbm[1].trim();

  // Build card CSS (inspired by md2rednote's generateStyles)
  const cardCSS = `
    @page { size: ${w}px ${h}px; margin: 30px; }
    @page cover { margin: 0; }
    @page cover { @top-center { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } @bottom-left { content: none; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize};
      color: ${color};
      line-height: ${lineHeight};
      background: ${containerBg};
    }
    .cover {
      page: cover;
      break-after: page;
      height: ${h}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 30px;
    }
    .cover h1 {
      font-size: 2.5em;
      font-weight: 800;
      line-height: 1.3;
      color: ${headingColor};
    }
    .content { }
    .page-break { break-after: page; }
    h1 { font-size: 1.75em; color: ${headingColor}; margin: 0 0 0.4em 0; break-after: avoid; }
    h2 { font-size: 1.375em; color: ${headingColor}; margin: 0.8em 0 0.3em 0; break-after: avoid; }
    h3 { font-size: 1.125em; color: ${headingColor}; margin: 0.6em 0 0.2em 0; break-after: avoid; }
    p { margin-bottom: 0.7em; text-align: justify; widows: 2; orphans: 2; }
    strong, b { color: ${boldColor}; }
    blockquote {
      border-left: ${bqBorder};
      padding: 4px 12px;
      margin: 0.6em 0;
      color: #666;
      font-style: italic;
      break-inside: avoid;
    }
    blockquote p { margin-bottom: 0.3em; }
    pre {
      background: ${codeBg};
      padding: 12px;
      border-radius: 6px;
      font-size: 0.8em;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      break-inside: avoid;
      margin: 0.5em 0;
      overflow: hidden;
    }
    code {
      background: ${codeBg};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.85em;
      font-family: 'SF Mono', Menlo, Consolas, monospace;
    }
    pre code { background: none; padding: 0; font-size: inherit; }
    ul, ol { margin: 0.4em 0; padding-left: 1.8em; }
    li { margin-bottom: 0.3em; break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 0.5em 0; font-size: 0.9em; break-inside: avoid; }
    th, td { padding: 5px 8px; border: 1px solid rgba(0,0,0,0.1); text-align: center; }
    th { background: ${codeBg}; font-weight: 600; }
    a { color: ${headingColor}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
    figure { margin: 0.5em 0; break-inside: avoid; }
    figcaption { text-align: center; font-size: 0.85em; color: #999; margin-top: 0.3em; }

    /* Footnotes */
    .footnote { margin-top: 1.5em; padding-top: 1em; border-top: 1px solid rgba(0,0,0,0.1); break-inside: avoid; }
    .footnote hr { display: none; }
    .footnote ol { margin: 0; padding-left: 1.5em; font-size: 0.8em; color: #888; }
    .footnote li { margin-bottom: 0.2em; line-height: 1.5; }
    .footnote-ref { color: ${headingColor}; text-decoration: none; font-weight: 600; }
    .footnote-backref { text-decoration: none; margin-left: 0.3em; }
    sup { font-size: 0.75em; vertical-align: super; line-height: 0; }

    /* GFM Alerts */
    [data-inkpress-alert] {
      margin: 0.8em 0; padding: 10px 14px; border-radius: 6px;
      border-left: 4px solid; break-inside: avoid;
    }
    [data-inkpress-alert-title] {
      font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; font-size: 0.9em;
    }
    [data-inkpress-alert-content] { font-size: 0.9em; color: #555; line-height: 1.5; }
    [data-inkpress-alert="NOTE"] { border-color: #1677ff; background: rgba(22,119,255,0.06); }
    [data-inkpress-alert="TIP"] { border-color: #52c41a; background: rgba(82,196,26,0.06); }
    [data-inkpress-alert="IMPORTANT"] { border-color: #722ed1; background: rgba(114,46,209,0.06); }
    [data-inkpress-alert="WARNING"] { border-color: #fa8c16; background: rgba(250,140,22,0.06); }
    [data-inkpress-alert="CAUTION"] { border-color: #f5222d; background: rgba(245,34,45,0.06); }

    /* Dialogue */
    .dialogue-container { break-inside: avoid; margin: 0.8em 0; }
    .dialogue-inner { background: rgba(0,0,0,0.02); }
    .dialogue-title { color: ${headingColor}; border-color: rgba(0,0,0,0.1) !important; }
    .dialogue-avatar-inner { background: ${headingColor}; color: #fff; }
  `;

  // Build iframe document — Paged.js paginates, then html2canvas captures each page
  const iframeHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${cardCSS}</style>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"><\/script>
<script>
  window.PagedConfig = {
    auto: true,
    after: function() {
      capturePages();
    }
  };

  async function capturePages() {
    const pageEls = document.querySelectorAll('.pagedjs_page');
    if (!pageEls.length) {
      window.parent.postMessage({ type: 'paged-rendered', pageCount: 0, images: [] }, '*');
      return;
    }
    const results = [];
    for (let i = 0; i < pageEls.length; i++) {
      try {
        const canvas = await html2canvas(pageEls[i], {
          width: ${w},
          height: ${h},
          scale: 1,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });
        results.push(canvas.toDataURL('image/png'));
      } catch(e) {
        console.error('Capture page ' + i + ' failed:', e);
        results.push(null);
      }
    }
    window.parent.postMessage({
      type: 'paged-rendered',
      pageCount: pageEls.length,
      images: results
    }, '*');
  }
<\/script>
</head><body>
${content}
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"><\/script>
</body></html>`;

  // Remove old listener
  if (_doRenderCard._listener) {
    window.removeEventListener('message', _doRenderCard._listener);
  }

  // Listen for page images from iframe
  _doRenderCard._listener = function(e) {
    if (e.data?.type !== 'paged-rendered') return;
    window.removeEventListener('message', _doRenderCard._listener);
    _doRenderCard._listener = null;
    _displayCardImages(e.data.images || [], w, h);
  };
  window.addEventListener('message', _doRenderCard._listener);

  // Timeout fallback
  setTimeout(() => {
    if (_doRenderCard._listener) {
      window.removeEventListener('message', _doRenderCard._listener);
      _doRenderCard._listener = null;
      // Try extracting from iframe directly as last resort
      const fb = document.getElementById('pagedFrame');
      if (fb) {
        const fbDoc = fb.contentDocument || fb.contentWindow.document;
        const pp = fbDoc.querySelectorAll('.pagedjs_page');
        if (pp.length) {
          document.getElementById('cardGrid').innerHTML =
            '<p style="color:var(--text-3);text-align:center;padding:40px;">Paged.js rendered ' + pp.length + ' pages but capture timed out. Check console.</p>';
        }
      }
    }
  }, 8000);

  // Create fresh iframe (avoid Paged.js state issues)
  const oldIframe = document.getElementById('pagedFrame');
  const newIframe = document.createElement('iframe');
  newIframe.id = 'pagedFrame';
  newIframe.style.cssText = 'position:absolute;left:-9999px;top:0;border:none;';
  newIframe.style.width = w + 'px';
  newIframe.style.height = (h * 10) + 'px'; // tall enough for all pages
  oldIframe.replaceWith(newIframe);

  const doc = newIframe.contentDocument || newIframe.contentWindow.document;
  doc.open();
  doc.write(iframeHTML);
  doc.close();
}

function _displayCardImages(images, w, h) {
  const grid = document.getElementById('cardGrid');
  if (!images.length) {
    grid.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:40px;">No pages rendered</p>';
    return;
  }

  const previewW = 338;
  const previewH = Math.round(h * (previewW / w));
  const total = images.length;

  let html = '';
  images.forEach((dataUrl, i) => {
    if (!dataUrl) return;
    html += `
      <div class="card-page" data-page="${i}" style="width:${previewW}px;height:${previewH}px;">
        <img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:6px;"
             data-full-url="${dataUrl}" data-export-w="${w}" data-export-h="${h}" />
        <div class="card-page-num">${i + 1} / ${total}</div>
      </div>`;
  });

  grid.innerHTML = html;

  // Click to zoom
  grid.querySelectorAll('.card-page').forEach(page => {
    page.addEventListener('click', () => {
      const img = page.querySelector('img');
      if (img) openCardLightbox(img.src);
    });
  });

  // Store full-res image data for export
  grid._cardImages = images;
  grid._cardDimensions = { w, h };
}

// ============ Card Lightbox ============
function openCardLightbox(src) {
  let overlay = document.getElementById('cardLightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cardLightbox';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out;opacity:0;transition:opacity 0.2s;';
    overlay.innerHTML = '<img style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.4);object-fit:contain;transition:transform 0.2s;" />';
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 200);
    });
    document.body.appendChild(overlay);
  }
  const img = overlay.querySelector('img');
  img.src = src;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
}

// ============ Card Export (ZIP) ============
async function exportCards() {
  if (typeof JSZip === 'undefined') {
    showToast('JSZip not loaded');
    return;
  }

  const btn = document.getElementById('cardExportBtn');
  const origText = btn.textContent;
  btn.textContent = t('editor.exporting');
  btn.disabled = true;

  try {
    // Re-render in iframe at high-res export scale
    const hiResImages = await _renderCardsHiRes();
    if (!hiResImages || !hiResImages.length) {
      showToast('No cards to export');
      return;
    }

    const zip = new JSZip();
    for (let i = 0; i < hiResImages.length; i++) {
      if (!hiResImages[i]) continue;
      // dataURL → binary
      const base64 = hiResImages[i].split(',')[1];
      zip.file(`inkpress-${currentTheme}-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.download = `inkpress-${currentTheme}-cards.zip`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    showToast(t('toast.cardExported').replace('{n}', hiResImages.length));
  } catch (e) {
    console.error('Export failed:', e);
    showToast('Export failed');
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }
}

// Re-render cards at export scale (2x) in a separate iframe pass
function _renderCardsHiRes() {
  return new Promise((resolve) => {
    const pagedFrame = document.getElementById('pagedFrame');
    if (!pagedFrame) { resolve([]); return; }

    const iframeDoc = pagedFrame.contentDocument || pagedFrame.contentWindow.document;
    const pages = iframeDoc.querySelectorAll('.pagedjs_page');
    if (!pages.length) { resolve([]); return; }

    const { w, h, exportScale } = getCardDimensions();
    const h2c = pagedFrame.contentWindow.html2canvas;
    if (!h2c) { resolve([]); return; }

    // Capture each page at export scale inside the existing iframe
    (async () => {
      const results = [];
      for (let i = 0; i < pages.length; i++) {
        try {
          const canvas = await h2c(pages[i], {
            width: w,
            height: h,
            scale: exportScale,
            useCORS: true,
            backgroundColor: null,
            logging: false,
          });
          results.push(canvas.toDataURL('image/png'));
        } catch (e) {
          console.error('Hi-res capture page ' + i + ' failed:', e);
          results.push(null);
        }
      }
      resolve(results);
    })();
  });
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
