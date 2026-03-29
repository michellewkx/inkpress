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
    html = this.styleFootnotes(html);
    html = this.styleGfmAlerts(html);
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

  // Helper: find matching close tag accounting for nesting
  _findMatchingClose(s, tag, start) {
    const openTag = `<${tag}`;
    const closeTag = `</${tag}>`;
    let depth = 1;
    let pos = start;
    while (depth > 0 && pos < s.length) {
      const nextOpen = s.indexOf(openTag, pos);
      const nextClose = s.indexOf(closeTag, pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) return nextClose;
        pos = nextClose + closeTag.length;
      }
    }
    return -1;
  }

  styleLists(html) {
    const lc = this.theme.list || {};
    const cs = (lc.container_style || '').trim();
    const is_ = (lc.item_style || '').trim();
    const ulp = lc.ul_prefix || '• ';
    const olp = lc.ol_prefix || '{n}. ';
    const ncs = (lc.nested_container_style || '').trim();
    const nis = (lc.nested_item_style || '').trim() || is_;
    const nulp = lc.nested_ul_prefix || '◦ ';
    if (!cs) return html;

    const UL_PREFIX_RE = /^[*\-+•]\s+/;
    const OL_PREFIX_RE = /^\d+\.\s+/;

    const self = this;

    function styleListBlock(content, tag, isNested) {
      const containerStyle = (isNested && ncs) ? ncs : cs;
      const itemStyle = isNested ? nis : is_;

      // Extract <li> blocks using tag counting
      const liBlocks = [];
      let searchPos = 0;
      while (true) {
        const liStart = content.indexOf('<li>', searchPos);
        if (liStart === -1) break;
        const innerStart = liStart + 4;
        const liEnd = self._findMatchingClose(content, 'li', innerStart);
        if (liEnd === -1) break;
        liBlocks.push(content.substring(innerStart, liEnd));
        searchPos = liEnd + 5;
      }

      const itemsHtml = liBlocks.map((liText, counter) => {
        liText = liText.trim();

        // Extract nested sublists
        let nestedHtml = '';
        for (const nestedTag of ['ul', 'ol']) {
          const nestedOpen = `<${nestedTag}>`;
          const idx = liText.indexOf(nestedOpen);
          if (idx !== -1) {
            const endIdx = self._findMatchingClose(liText, nestedTag, idx + nestedOpen.length);
            if (endIdx !== -1) {
              const nestedContent = liText.substring(idx + nestedOpen.length, endIdx);
              nestedHtml = styleListBlock(nestedContent, nestedTag, true);
              liText = liText.substring(0, idx) + liText.substring(endIdx + `</${nestedTag}>`.length);
            }
          }
        }

        liText = liText.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1').trim();
        liText = liText.replace(UL_PREFIX_RE, '').replace(OL_PREFIX_RE, '');

        let pfx;
        if (tag === 'ul') {
          pfx = isNested ? nulp : ulp;
        } else {
          pfx = olp.replace('{n}', counter + 1);
        }

        let liOut = `  <li style="${itemStyle}">${pfx}${liText}`;
        if (nestedHtml) liOut += `\n${nestedHtml}`;
        liOut += '</li>';
        return liOut;
      });

      return `<${tag} style="${containerStyle}">\n${itemsHtml.join('\n')}\n</${tag}>`;
    }

    // Process top-level UL blocks
    let pos = 0;
    while (true) {
      const idx = html.indexOf('<ul>', pos);
      if (idx === -1) break;
      const endIdx = this._findMatchingClose(html, 'ul', idx + 4);
      if (endIdx === -1) break;
      const inner = html.substring(idx + 4, endIdx);
      const replacement = styleListBlock(inner, 'ul', false);
      html = html.substring(0, idx) + replacement + html.substring(endIdx + 5);
      pos = idx + replacement.length;
    }

    // Process top-level OL blocks (skip footnote OLs)
    pos = 0;
    while (true) {
      const idx = html.indexOf('<ol>', pos);
      if (idx === -1) break;
      const preceding = html.substring(Math.max(0, idx - 200), idx);
      if (preceding.includes('role="doc-footnotes"')) {
        pos = idx + 4;
        continue;
      }
      const endIdx = this._findMatchingClose(html, 'ol', idx + 4);
      if (endIdx === -1) break;
      const inner = html.substring(idx + 4, endIdx);
      const replacement = styleListBlock(inner, 'ol', false);
      html = html.substring(0, idx) + replacement + html.substring(endIdx + 5);
      pos = idx + replacement.length;
    }

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

  styleFootnotes(html) {
    const fc = this.theme.footnote || {};
    if (!Object.keys(fc).length) return html;

    const supStyle = (fc.sup_style || '').trim();
    const refStyle = (fc.ref_style || '').trim();
    const sectionStyle = (fc.section_style || '').trim();
    const listStyle = (fc.list_style || '').trim();
    const itemStyle = (fc.item_style || '').trim();
    const backrefStyle = (fc.backref_style || '').trim();

    if (supStyle) {
      html = html.replace(/<sup id="fnref:/g, `<sup style="${supStyle}" id="fnref:`);
    }
    if (refStyle) {
      html = html.replace(/<a class="footnote-ref" href="([^"]+)">(\d+)<\/a>/g,
        `<a href="$1" style="${refStyle}">[$2]</a>`);
    }
    if (sectionStyle) {
      html = html.replace(/<div class="footnote">\s*<hr\s*\/?>/s,
        `<section role="doc-footnotes" style="${sectionStyle}">`);
      html = html.replace(/<\/ol>\s*<\/div>\s*$/, '</ol>\n</section>');
    }
    if (listStyle) {
      html = html.replace(/(<section role="doc-footnotes"[^>]*>)\s*<ol>/,
        `$1\n<ol style="${listStyle}">`);
    }
    if (itemStyle) {
      html = html.replace(/<li id="fn:(\d+)">/g, `<li id="fn:$1" style="${itemStyle}">`);
    }
    if (backrefStyle) {
      html = html.replace(/<a class="footnote-backref"([^>]*)>/g,
        `<a class="footnote-backref" style="${backrefStyle}"$1>`);
    }
    return html;
  }

  styleGfmAlerts(html) {
    const ac = this.theme.gfm_alert || {};
    const containerStyle = (ac.container_style || 'margin: 1.5em 0; padding: 12px 16px; border-radius: 4px;').trim();
    const titleStyle = (ac.title_style || 'font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;').trim();
    const contentStyle = (ac.content_style || 'color: #555; line-height: 1.6;').trim();

    const defaultColors = {
      NOTE: '#1677ff', TIP: '#52c41a', IMPORTANT: '#fa8c16',
      WARNING: '#f5222d', CAUTION: '#a0d911'
    };

    for (const [alertType, defaultColor] of Object.entries(defaultColors)) {
      const color = ac[`${alertType.toLowerCase()}_color`] || defaultColor;
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgb = `${r}, ${g}, ${b}`;

      const typeContainer = `${containerStyle} border-left: 4px solid ${color}; background: rgba(${rgb}, 0.05);`;
      const typeTitle = `${titleStyle} color: ${color};`;

      html = html.replace(
        new RegExp(`<div data-inkpress-alert="${alertType}" data-alert-color="[^"]*">`, 'g'),
        `<div style="${typeContainer}">`
      );
      html = html.replace(
        new RegExp(`<div data-inkpress-alert-title="${alertType}">`, 'g'),
        `<div style="${typeTitle}">`
      );
      html = html.replace(
        new RegExp(`<div data-inkpress-alert-content="${alertType}">`, 'g'),
        `<div style="${contentStyle}">`
      );
    }
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
    const is_ = (ic.img_style || '').trim();
    const captionStyle = (ic.caption_style || '').trim();

    if (cs) {
      html = html.replace(/<p[^>]*>\s*(<img[^>]+>)\s*<\/p>/g, (_, imgTag) => {
        const altMatch = imgTag.match(/alt="([^"]*)"/);
        const altText = altMatch ? altMatch[1] : '';
        let captionHtml = '';
        if (captionStyle && altText) {
          captionHtml = `<figcaption style="${captionStyle}">${altText}</figcaption>`;
        }
        return `<figure style="${cs}">${imgTag}${captionHtml}</figure>`;
      });
    }
    if (is_) {
      html = html.replace(/<img(?![^>]*style=)([^>]*)>/g, `<img style="${is_}"$1>`);
    }
    return html;
  }

  styleTables(html) {
    const tc = this.theme.table || {};
    const style = (tc.style || '').trim();
    const thStyle = (tc.th_style || '').trim();
    const tdStyle = (tc.td_style || '').trim();
    const trOddStyle = (tc.tr_odd_style || '').trim();
    const wrapperStyle = (tc.wrapper_style || '').trim();

    if (style) html = html.replace(/<table[^>]*>/g, `<table style="${style}">`);
    if (thStyle) html = html.replace(/<th(?=[\s>])(?![^>]*style=)([^>]*)>/g, `<th style="${thStyle}"$1>`);
    if (tdStyle) html = html.replace(/<td(?=[\s>])(?![^>]*style=)([^>]*)>/g, `<td style="${tdStyle}"$1>`);

    // Zebra striping
    if (trOddStyle) {
      html = html.replace(/<tbody>(.*?)<\/tbody>/gs, (_, tbodyContent) => {
        const rows = [...tbodyContent.matchAll(/<tr>(.*?)<\/tr>/gs)].map(m => m[1]);
        const styledRows = rows.map((rowContent, i) => {
          if (i % 2 === 0) {
            rowContent = rowContent.replace(/<td([^>]*?)style="([^"]*)"/g,
              (__, attrs, existingStyle) => `<td${attrs}style="${existingStyle} ${trOddStyle}"`);
          }
          return `<tr>${rowContent}</tr>`;
        });
        return '<tbody>' + styledRows.join('\n') + '</tbody>';
      });
    }

    // Wrap tables
    if (wrapperStyle) {
      html = html.replace(/(<table[^>]*>.*?<\/table>)/gs,
        `<div style="${wrapperStyle}">$1</div>`);
    }

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
