/**
 * inkpress JS renderer - mirrors the Python engine's _apply_styles logic.
 * Takes parsed HTML from marked.js and injects inline styles from theme config.
 */

class InkpressRenderer {
  constructor(theme) {
    this.theme = theme;
    this.decorations = theme.decorations || {};
  }

  getStyle(element) {
    const config = this.theme[element];
    if (!config) return '';
    if (typeof config === 'string') return config.trim();
    return (config.style || '').trim();
  }

  getDeco(key, def = '') {
    return this.decorations[key] || def;
  }

  render(markdown) {
    let html = marked.parse(markdown);
    html = this.styleHeadings(html);
    html = this.styleParagraphs(html);
    html = this.styleLists(html);
    html = this.styleCodeBlocks(html);
    html = this.styleInlineCode(html);
    html = this.styleBlockquotes(html);
    html = this.styleLinks(html);
    html = this.styleImages(html);
    html = this.styleTables(html);
    html = this.styleHr(html);
    html = this.styleEmphasis(html);
    return this.wrapHtml(html);
  }

  styleHeadings(html) {
    for (let l = 1; l <= 6; l++) {
      const style = this.getStyle(`h${l}`);
      const prefix = this.getDeco(`h${l}_prefix`);
      if (style || prefix) {
        const re = new RegExp(`<h${l}[^>]*>(.*?)</h${l}>`, 'gs');
        html = html.replace(re, (_, content) =>
          `<h${l} style="${style}">${prefix}${content}</h${l}>`
        );
      }
    }
    return html;
  }

  styleParagraphs(html) {
    const style = this.getStyle('paragraph');
    if (style) {
      html = html.replace(/<p>(?!\s*<figure)(.*?)<\/p>/gs,
        `<p style="${style}">$1</p>`);
    }
    return html;
  }

  styleLists(html) {
    const lc = this.theme.list || {};
    const cs = (lc.container_style || '').trim();
    const is = (lc.item_style || '').trim();
    const ulp = lc.ul_prefix || '• ';
    const olp = lc.ol_prefix || '{n}. ';
    if (!cs) return html;

    html = html.replace(/<ul>(.*?)<\/ul>/gs, (_, content) => {
      const items = [...content.matchAll(/<li>(.*?)<\/li>/gs)]
        .map(m => m[1].replace(/<p[^>]*>(.*?)<\/p>/gs, '$1').trim());
      const itemsHtml = items.map(item =>
        `<li style="${is}">${ulp}${item}</li>`).join('\n');
      return `<ul style="${cs}">\n${itemsHtml}\n</ul>`;
    });

    let olCounter = 0;
    html = html.replace(/<ol>(.*?)<\/ol>/gs, (_, content) => {
      const items = [...content.matchAll(/<li>(.*?)<\/li>/gs)]
        .map(m => m[1].replace(/<p[^>]*>(.*?)<\/p>/gs, '$1').trim());
      const itemsHtml = items.map((item, i) =>
        `<li style="${is}">${olp.replace('{n}', i + 1)}${item}</li>`).join('\n');
      return `<ol style="${cs}">\n${itemsHtml}\n</ol>`;
    });

    return html;
  }

  styleCodeBlocks(html) {
    const cc = this.theme.code_block || {};
    const style = (cc.style || '').trim();
    const codeStyle = (cc.code_inner_style || '').trim();
    if (style) {
      html = html.replace(/<pre(?![^>]*style=)([^>]*)>/g, `<pre style="${style}"$1>`);
    }
    if (codeStyle) {
      // Only apply code_inner_style to <code> tags directly inside <pre> blocks
      html = html.replace(/<pre([^>]*)><code(?![^>]*style=)([^>]*)>/g,
        `<pre$1><code style="${codeStyle}"$2>`);
    }
    return html;
  }

  styleInlineCode(html) {
    const style = this.getStyle('inline_code');
    if (style) {
      html = html.replace(/<code(?![^>]*style=)([^>]*)>/g, `<code style="${style}"$1>`);
    }
    return html;
  }

  styleBlockquotes(html) {
    const bc = this.theme.blockquote || {};
    const style = (bc.style || '').trim();
    const pStyle = (bc.p_inner_style || '').trim();
    const prefix = this.getDeco('blockquote_prefix');
    const suffix = this.getDeco('blockquote_suffix');
    if (!style) return html;

    html = html.replace(/<blockquote>(.*?)<\/blockquote>/gs, (_, content) => {
      if (pStyle) {
        content = content.replace(/<p[^>]*>(.*?)<\/p>/gs, `<p style="${pStyle}">$1</p>`);
      }
      if (prefix || suffix) {
        content = content.replace(/(<p[^>]*>)(.*?)(<\/p>)/gs,
          `$1${prefix}$2${suffix}$3`);
      }
      return `<blockquote style="${style}">${content}</blockquote>`;
    });
    return html;
  }

  styleLinks(html) {
    const style = this.getStyle('link');
    if (style) {
      html = html.replace(/<a(?![^>]*style=)([^>]*)>/g, `<a style="${style}"$1>`);
    }
    return html;
  }

  styleImages(html) {
    const ic = this.theme.image || {};
    const cs = (ic.container_style || '').trim();
    const is = (ic.img_style || '').trim();
    if (cs) {
      html = html.replace(/<p(?![^>]*style=)([^>]*)>\s*(<img[^>]+>)\s*<\/p>/g,
        `<figure style="${cs}">$2</figure>`);
    }
    if (is) {
      html = html.replace(/<img(?![^>]*style=)([^>]*)>/g, `<img style="${is}"$1>`);
    }
    return html;
  }

  styleTables(html) {
    const tc = this.theme.table || {};
    const style = (tc.style || '').trim();
    const thStyle = (tc.th_style || '').trim();
    const tdStyle = (tc.td_style || '').trim();
    if (style) html = html.replace(/<table[^>]*>/g, `<table style="${style}">`);
    // Use word boundary after tag name to avoid matching <thead> as <th> and <tbody> as <td>
    if (thStyle) html = html.replace(/<th(?=[\s>])(?![^>]*style=)([^>]*)>/g, `<th style="${thStyle}"$1>`);
    if (tdStyle) html = html.replace(/<td(?=[\s>])(?![^>]*style=)([^>]*)>/g, `<td style="${tdStyle}"$1>`);
    return html;
  }

  styleHr(html) {
    const hrText = this.getDeco('hr_text');
    if (hrText) {
      html = html.replace(/<hr[^>]*>/g,
        `<p style="text-align:center;margin:2em 0;color:#999;font-size:14px;letter-spacing:0.3em;">${hrText}</p>`);
    } else {
      const style = this.getStyle('hr');
      if (style) html = html.replace(/<hr[^>]*>/g, `<hr style="${style}">`);
    }
    return html;
  }

  styleEmphasis(html) {
    const bold = this.getStyle('bold');
    const italic = this.getStyle('italic');
    const strike = this.getStyle('strikethrough');
    if (bold) {
      html = html.replace(/<strong(?![^>]*style=)([^>]*)>/g, `<strong style="${bold}"$1>`);
    }
    if (italic) {
      html = html.replace(/<em(?![^>]*style=)([^>]*)>/g, `<em style="${italic}"$1>`);
    }
    if (strike) {
      html = html.replace(/<del(?![^>]*style=)([^>]*)>/g, `<del style="${strike}"$1>`);
    }
    return html;
  }

  wrapHtml(content) {
    const c = this.theme.container || {};
    const b = this.theme.body || {};
    const maxWidth = c.max_width || '677px';
    const padding = c.padding || '8px';
    const bg = c.background || '#ffffff';
    const radius = c.border_radius || '12px';
    const shadow = c.box_shadow || '';
    const bodyBg = b.background || '#f9f9f9';
    const bodyPad = b.padding || '16px';

    // Extract global font props from paragraph style
    const pStyle = this.getStyle('paragraph');
    let globalStyle = '';
    for (const prop of ['font-family', 'color', 'line-height', 'font-size']) {
      const m = pStyle.match(new RegExp(`${prop}:\\s*([^;]+)`));
      if (m) globalStyle += ` ${prop}: ${m[1].trim()};`;
    }

    let containerStyle = `max-width:${maxWidth};margin:0 auto;padding:${padding};background-color:${bg};${globalStyle} border-radius:${radius};`;
    if (shadow) containerStyle += ` box-shadow:${shadow};`;

    return `<section style="${containerStyle}">${content}</section>`;
  }
}
