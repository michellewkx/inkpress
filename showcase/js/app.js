/**
 * inkpress showcase app — theme gallery + live editor
 */

const SERIES_LABELS = {
  classic: '经典 Classic',
  tech: '科技 Tech',
  oriental: '东方 Oriental',
  magazine: '杂志 Magazine',
  social: '社交 Social',
  other: '其他'
};

const SAMPLE_MD = `# inkpress 墨印

> 把 Markdown 变成微信公众号排版

## 特性亮点

inkpress 是一个**零依赖、零付费**的 Markdown 转微信排版工具。支持 20+ 精品主题，完全离线运行。

### 为什么选择 inkpress？

1. **完全免费** — 所有功能永久免费
2. **精品主题** — 5 大系列、20+ 手工打磨的主题
3. **零依赖** — 不需要任何外部 API

---

## 代码示例

\`\`\`python
from inkpress import convert

html = convert("# Hello", theme="cyberpunk")
\`\`\`

行内代码也很好看：\`pip install inkpress\`

## 引用样式

> 好的排版让内容更有力量。
> — inkpress

## 表格

| 功能 | inkpress | 竞品 |
|------|---------|------|
| 免费 | ✅ | ❌ |
| 离线 | ✅ | ❌ |
| 主题 | 20+ | 3-5 |

## 强调

这是**粗体**，这是*斜体*，这是~~删除线~~。

![示例图片](https://picsum.photos/600/300)
`;

let currentTheme = 'default';
let currentFilter = 'all';

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THEMES === 'undefined') {
    console.warn('themes.js not loaded');
    return;
  }
  initTabs();
  initGallery();
  initEditor();
  renderPreview();
});

function initTabs() {
  const tabs = document.getElementById('tabs');
  const series = new Set();
  for (const [name, theme] of Object.entries(THEMES)) {
    series.add(theme.series || 'other');
  }

  let html = '<div class="tab active" data-series="all">全部</div>';
  for (const s of ['classic', 'tech', 'oriental', 'magazine', 'social']) {
    if (series.has(s)) {
      html += `<div class="tab" data-series="${s}">${SERIES_LABELS[s] || s}</div>`;
    }
  }
  tabs.innerHTML = html;

  tabs.addEventListener('click', e => {
    if (!e.target.classList.contains('tab')) return;
    tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.series;
    renderGallery();
  });
}

function initGallery() {
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('themeGrid');
  let html = '';

  for (const [name, theme] of Object.entries(THEMES)) {
    const series = theme.series || 'other';
    if (currentFilter !== 'all' && series !== currentFilter) continue;

    const tags = (theme.tags || []).map(t => `<span class="theme-tag">${t}</span>`).join('');
    const isActive = name === currentTheme ? 'active' : '';
    const previewHtml = generatePreviewSnippet(theme);

    html += `
      <div class="theme-card ${isActive}" data-theme="${name}" onclick="selectTheme('${name}')">
        <div class="theme-preview" style="background:${theme.body?.background || '#f9f9f9'}">${previewHtml}</div>
        <div class="theme-info">
          <div class="theme-name">${theme.name || name}</div>
          <div class="theme-desc">${theme.description || ''}</div>
          <div class="theme-tags">${tags}</div>
        </div>
      </div>`;
  }

  grid.innerHTML = html || '<p style="color:var(--text-dim)">No themes found.</p>';
}

function generatePreviewSnippet(theme) {
  const renderer = new InkpressRenderer(theme);
  const miniMd = `## 标题示例\n\n这是正文内容，展示**主题效果**和*样式特点*。\n\n> 引用文本在这里\n\n- 列表项一\n- 列表项二`;
  return renderer.render(miniMd);
}

function initEditor() {
  const input = document.getElementById('mdInput');
  const select = document.getElementById('themeSelect');

  input.value = SAMPLE_MD;

  let html = '';
  for (const [name, theme] of Object.entries(THEMES)) {
    html += `<option value="${name}" ${name === currentTheme ? 'selected' : ''}>${theme.name || name}</option>`;
  }
  select.innerHTML = html;

  select.addEventListener('change', () => {
    selectTheme(select.value);
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderPreview, 200);
  });
}

function selectTheme(name) {
  currentTheme = name;
  document.getElementById('themeSelect').value = name;
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === name);
  });
  renderPreview();
}

function renderPreview() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return;

  const renderer = new InkpressRenderer(theme);
  const html = renderer.render(md);
  const frame = document.getElementById('previewFrame');
  frame.innerHTML = html;
}

function getFullHTML() {
  const md = document.getElementById('mdInput').value;
  const theme = THEMES[currentTheme];
  if (!theme) return '';
  const renderer = new InkpressRenderer(theme);
  return renderer.render(md);
}

function copyHTML() {
  const html = getFullHTML();
  // Copy as rich HTML for WeChat paste
  const blob = new Blob([html], { type: 'text/html' });
  navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => {
    showToast('已复制到剪贴板');
  }).catch(() => {
    // Fallback: copy as text
    navigator.clipboard.writeText(html).then(() => {
      showToast('已复制 HTML 文本');
    });
  });
}

function downloadHTML() {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>inkpress</title></head><body style="margin:0;padding:16px;background:#f9f9f9;">${getFullHTML()}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `inkpress-${currentTheme}.html`;
  a.click();
}

function showToast(msg) {
  const toast = document.getElementById('copyToast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
