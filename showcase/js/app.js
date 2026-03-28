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
    'gallery.preview': '预览全文',
    'install.title': '快速开始',
    'install.desc': '通过 pip 安装，秒级启动',
    'editor.title': '在线编辑器',
    'editor.copy': '复制 HTML',
    'editor.download': '下载',
    'editor.copyRich': '复制到微信',
    'editor.input': 'MARKDOWN 输入',
    'editor.preview': '实时预览',
    'preview.edit': '在编辑器中打开',
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
    'gallery.preview': 'Full Preview',
    'install.title': 'Quick Start',
    'install.desc': 'Install via pip, start in seconds',
    'editor.title': 'Editor',
    'editor.copy': 'Copy HTML',
    'editor.download': 'Download',
    'editor.copyRich': 'Copy for WeChat',
    'editor.input': 'MARKDOWN',
    'editor.preview': 'PREVIEW',
    'preview.edit': 'Open in Editor',
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

const SAMPLE_MD = `# inkpress 墨印

> 把 Markdown 变成精美排版

## 特性亮点

inkpress 是一个**零依赖、零付费**的 Markdown 排版引擎。支持 25+ 精品主题，完全离线运行。

### 为什么选择 inkpress？

1. **完全免费** — 所有功能永久免费
2. **精品主题** — 5 大系列、25+ 手工打磨的主题
3. **零依赖** — 不需要任何外部 API

---

## 代码示例

\`\`\`python
from inkpress import convert

html = convert("# Hello", theme="aurora")
\`\`\`

行内代码：\`pip install inkpress\`

## 引用样式

> 好的排版让内容更有力量。
> — inkpress

## 表格

| 功能 | inkpress | 竞品 |
|------|---------|------|
| 免费 | ✅ | ❌ |
| 离线 | ✅ | ❌ |
| 主题 | 25+ | 3-5 |

## 强调

这是**粗体**，这是*斜体*，这是~~删除线~~。
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
  initPreviewModal();
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
      <div class="card card-anim" data-theme="${name}" style="animation-delay:${Math.min(visibleCount * 0.06, 0.5)}s">
        <div class="card-body">
          <div class="card-prev" style="background:${bgColor}">
            <div class="card-prev-in" style="background:${theme.container?.background || '#fff'};${theme.container?.border ? 'border:' + theme.container.border + ';' : ''}${theme.container?.border_radius ? 'border-radius:' + theme.container.border_radius + ';' : 'border-radius:8px;'}">
              ${previewHtml}
            </div>
            <div class="card-ov">
              <button class="card-ov-btn" onclick="openPreviewModal('${name}')">${t('gallery.preview')} <span class="arr">→</span></button>
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

// ============ Preview Modal ============
function initPreviewModal() {
  document.getElementById('pmCloseBtn').addEventListener('click', closePreviewModal);
  document.getElementById('pmEditBtn').addEventListener('click', () => {
    const name = document.getElementById('previewModal').dataset.theme;
    closePreviewModal();
    if (name) {
      currentTheme = name;
      document.getElementById('editorThemeSelect').value = name;
    }
    openEditor();
  });
  document.getElementById('previewModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePreviewModal();
  });
}

function openPreviewModal(name) {
  const theme = THEMES[name];
  if (!theme) return;

  const modal = document.getElementById('previewModal');
  modal.dataset.theme = name;
  document.getElementById('previewModalTitle').textContent = theme.name || name;

  const renderer = new InkpressRenderer(theme);
  document.getElementById('previewModalBody').innerHTML = renderer.render(SAMPLE_MD);

  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('open'));
  document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
    if (!document.getElementById('editorOverlay').classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }, 300);
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
      if (document.getElementById('previewModal').classList.contains('open')) {
        closePreviewModal();
      } else if (document.getElementById('editorOverlay').classList.contains('open')) {
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
