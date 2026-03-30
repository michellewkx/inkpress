/**
 * inkpress JS renderer - mirrors the Python engine's _apply_styles logic.
 * Takes parsed HTML from marked.js and injects inline styles from theme config.
 */

class InkpressRenderer {
  constructor(theme, options = {}) {
    this.theme = theme;
    this.decorations = theme.decorations || {};
    this.watermark = options.watermark !== false;
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
    const [processed, placeholders] = this.preprocessMarkdown(markdown);
    let html = marked.parse(processed);
    // Restore placeholders (may be wrapped in <p> tags)
    for (const [key, value] of Object.entries(placeholders)) {
      html = html.replace(new RegExp(`<p>\\s*${key}\\s*</p>`, 'g'), value);
      html = html.replace(key, value);
    }
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
    html = this.styleDialogue(html);
    return this.wrapHtml(html);
  }

  renderContent(markdown) {
    const [processed, placeholders] = this.preprocessMarkdown(markdown);
    let html = marked.parse(processed);
    for (const [key, value] of Object.entries(placeholders)) {
      html = html.replace(new RegExp(`<p>\\s*${key}\\s*</p>`, 'g'), value);
      html = html.replace(key, value);
    }
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
    html = this.styleDialogue(html);
    return html;
  }

  // Preprocess markdown: handle GFM alerts, strikethrough, etc.
  // Mirrors Python parser.py's preprocess_markdown()
  preprocessMarkdown(text) {
    const placeholders = {};
    let counter = 0;
    const makePlaceholder = (html) => {
      const key = `INKPRESS_JS_BLOCK_${counter++}`;
      placeholders[key] = html;
      return key;
    };

    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // GFM Alerts: > [!NOTE] ... → HTML skeleton with data attributes
    const ALERT_TYPES = {
      NOTE:      ['提示', '#1677ff', '📌'],
      TIP:       ['技巧', '#52c41a', '💡'],
      IMPORTANT: ['重要', '#fa8c16', '⚠️'],
      WARNING:   ['警告', '#f5222d', '🔔'],
      CAUTION:   ['注意', '#a0d911', '⚡'],
    };

    const lines = text.split('\n');
    const result = [];
    let i = 0;

    // First pass: extract footnote definitions [^n]: text
    const footnoteDefs = {};
    const nonFootnoteLines = [];
    for (const line of lines) {
      const fnDefMatch = line.match(/^\[\^(\d+)\]:\s*(.+)$/);
      if (fnDefMatch) {
        footnoteDefs[fnDefMatch[1]] = fnDefMatch[2];
      } else {
        nonFootnoteLines.push(line);
      }
    }

    i = 0;
    while (i < nonFootnoteLines.length) {
      const alertMatch = nonFootnoteLines[i].match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
      if (alertMatch) {
        const alertType = alertMatch[1];
        const [label, color, icon] = ALERT_TYPES[alertType];
        const contentLines = [];
        i++;
        while (i < nonFootnoteLines.length && nonFootnoteLines[i].startsWith('>')) {
          contentLines.push(nonFootnoteLines[i].substring(1).trim());
          i++;
        }
        const contentHtml = marked.parse(contentLines.join('\n')).replace(/^<p>(.*)<\/p>\s*$/s, '$1');
        const alertHtml =
          `<div data-inkpress-alert="${alertType}" data-alert-color="${color}">` +
          `<div data-inkpress-alert-title="${alertType}">` +
          `<span>${icon}</span><span>${label}</span></div>` +
          `<div data-inkpress-alert-content="${alertType}">${contentHtml}</div></div>`;
        result.push(makePlaceholder(alertHtml));
      } else {
        result.push(nonFootnoteLines[i]);
        i++;
      }
    }

    // Gallery: :::gallery[title]\n![alt](url)\n:::
    const galleryProcessed = [];
    const galleryLines = result;
    let gi = 0;
    while (gi < galleryLines.length) {
      const galleryMatch = galleryLines[gi].match(/^:::gallery\[([^\]]*)\]/);
      if (galleryMatch) {
        const galleryTitle = galleryMatch[1];
        const galleryImages = [];
        gi++;
        while (gi < galleryLines.length && !galleryLines[gi].startsWith(':::')) {
          const imgMatch = galleryLines[gi].match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imgMatch) galleryImages.push([imgMatch[1], imgMatch[2]]);
          gi++;
        }
        if (gi < galleryLines.length && galleryLines[gi].startsWith(':::')) gi++; // skip closing :::
        if (galleryImages.length > 0) {
          const imgsHtml = galleryImages.map(([alt, url]) =>
            `<div style="flex: 0 0 auto; width: 280px; height: 200px; margin-right: 12px; border-radius: 8px; overflow: hidden;">` +
            `<img src="${url}" alt="${alt}" style="width: 100%; height: 100%; object-fit: cover;"></div>`
          ).join('\n');
          galleryProcessed.push(makePlaceholder(
            `<div style="margin: 2em 0; padding: 16px; background: #f5f5f5; border-radius: 8px;">` +
            `<div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333;">📷 ${galleryTitle}</div>` +
            `<div style="display: flex; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; -webkit-overflow-scrolling: touch;">` +
            `${imgsHtml}</div></div>`
          ));
        }
      } else {
        galleryProcessed.push(galleryLines[gi]);
        gi++;
      }
    }

    // Long image: :::longimage[title]\n![alt](url)\n:::
    const longimgProcessed = [];
    let li = 0;
    while (li < galleryProcessed.length) {
      const longMatch = galleryProcessed[li].match(/^:::longimage\[([^\]]*)\]/);
      if (longMatch) {
        const longTitle = longMatch[1];
        let imgAlt = '', imgUrl = '';
        li++;
        while (li < galleryProcessed.length && !galleryProcessed[li].startsWith(':::')) {
          const imgMatch = galleryProcessed[li].match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imgMatch) { imgAlt = imgMatch[1]; imgUrl = imgMatch[2]; }
          li++;
        }
        if (li < galleryProcessed.length && galleryProcessed[li].startsWith(':::')) li++;
        if (imgUrl) {
          longimgProcessed.push(makePlaceholder(
            `<div style="margin: 2em 0; padding: 16px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e8e8e8;">` +
            `<div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333;">📋 ${longTitle}</div>` +
            `<div style="max-height: 600px; overflow-y: auto; text-align: center;">` +
            `<img src="${imgUrl}" alt="${imgAlt}" style="max-width: 100%; height: auto; border-radius: 4px;"></div></div>`
          ));
        }
      } else {
        longimgProcessed.push(galleryProcessed[li]);
        li++;
      }
    }

    // Dialogue: :::dialogue[title]\nSpeaker: text\n:::
    const dialogueProcessed = [];
    let di = 0;
    while (di < longimgProcessed.length) {
      const dlgMatch = longimgProcessed[di].match(/^:::dialogue\[([^\]]*)\]/);
      if (dlgMatch) {
        const dlgTitle = dlgMatch[1];
        const messages = [];
        di++;
        while (di < longimgProcessed.length && !longimgProcessed[di].startsWith(':::')) {
          const line = longimgProcessed[di].trim();
          if (line) {
            const msgMatch = line.match(/^([^:：]+)[:：](.+)$/);
            if (msgMatch) messages.push([msgMatch[1].trim(), msgMatch[2].trim()]);
          }
          di++;
        }
        if (di < longimgProcessed.length && longimgProcessed[di].startsWith(':::')) di++;
        if (messages.length > 0) {
          const msgsHtml = messages.map(([speaker, text], idx) => {
            const isRight = idx % 2 === 1;
            const side = isRight ? 'right' : 'left';
            const initial = speaker[0] || 'U';
            const avatarHtml =
              `<section class="dialogue-avatar" data-dialogue-side="${side}" ` +
              `style="display: inline-block; vertical-align: top; width: 40px; height: 40px; box-sizing: border-box; position: relative; flex-shrink: 0;">` +
              `<section class="dialogue-avatar-inner" data-dialogue-side="${side}" ` +
              `style="width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); box-sizing: border-box;">` +
              `<span class="dialogue-avatar-text" data-dialogue-side="${side}" style="font-size: 13px; font-weight: 600;" leaf="">${initial}</span>` +
              `</section></section>`;
            const bubbleHtml =
              `<section class="dialogue-bubble" data-dialogue-side="${side}" ` +
              `style="display: inline-block; vertical-align: top; padding: 10px 14px; max-width: 65%; color: inherit; line-height: 1.5; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); word-wrap: break-word; box-sizing: border-box; text-align: left;">` +
              `<p style="margin: 0px; color: inherit; line-height: 1.5; font-size: 14px; text-align: left; box-sizing: border-box;">` +
              `<span leaf="">${text}</span></p></section>`;
            const inner = isRight ? bubbleHtml + avatarHtml : avatarHtml + bubbleHtml;
            const align = isRight ? 'text-align: right;' : 'text-align: left;';
            const padding = isRight ? 'padding-right: 0px;' : 'padding-left: 0px;';
            return `<section style="margin: 12px 0px; box-sizing: border-box; clear: both;">` +
              `<section style="${align} box-sizing: border-box; ${padding}">${inner}</section></section>`;
          }).join('');

          dialogueProcessed.push(makePlaceholder(
            `<section class="dialogue-container" data-mpa-template="t" mpa-data-temp-power-by="inkpress" mpa-from-tpl="t" data-mpa-action-id="dialogue">` +
            `<section data-mpa-template="t" mpa-from-tpl="t">` +
            `<section style="box-sizing: border-box; width: 100%;" mpa-from-tpl="t">` +
            `<section style="box-sizing: border-box; width: 100%;" mpa-from-tpl="t">` +
            `<section class="dialogue-inner" style="margin: 12px 8px 16px; padding: 12px; border-radius: 12px; box-sizing: border-box;" mpa-from-tpl="t">` +
            `<section style="margin: 0px; padding: 0px; box-sizing: border-box;" mpa-from-tpl="t">` +
            `<section class="dialogue-title" style="text-align: center; font-size: 16px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid; letter-spacing: 0.5px; box-sizing: border-box;" mpa-from-tpl="t">` +
            `<p style="margin: 0px; text-align: center; box-sizing: border-box;">` +
            `<span class="dialogue-title-text" style="font-size: 16px; font-weight: 600;" leaf="">💬 ${dlgTitle}</span></p></section>` +
            `<section style="margin: 0px; padding: 0px; box-sizing: border-box;" mpa-from-tpl="t">${msgsHtml}</section>` +
            `</section></section></section></section></section></section>`
          ));
        }
      } else {
        dialogueProcessed.push(longimgProcessed[di]);
        di++;
      }
    }

    // Process inline footnote references [^n] → <sup>...</sup>
    let processed = dialogueProcessed.join('\n');
    processed = processed.replace(/\[\^(\d+)\]/g, (_, n) =>
      `<sup id="fnref:${n}"><a class="footnote-ref" href="#fn:${n}">${n}</a></sup>`
    );

    // Build footnote section if definitions exist
    const fnIds = Object.keys(footnoteDefs).sort((a, b) => Number(a) - Number(b));
    if (fnIds.length > 0) {
      const fnItems = fnIds.map(id => {
        const defHtml = marked.parse(footnoteDefs[id]).replace(/^<p>(.*)<\/p>\s*$/s, '$1');
        return `<li id="fn:${id}">${defHtml} <a class="footnote-backref" href="#fnref:${id}" title="Jump back">↩</a></li>`;
      }).join('\n');
      const fnSection = `<div class="footnote"><hr />\n<ol>\n${fnItems}\n</ol>\n</div>`;
      processed += '\n' + makePlaceholder(fnSection);
    }

    return [processed, placeholders];
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
      if (preceding.includes('role="doc-footnotes"') || preceding.includes('class="footnote"')) {
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
      html = html.replace(/<\/ol>\s*<\/div>/, '</ol>\n</section>');
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

  styleDialogue(html) {
    const dc = this.theme.dialogue || {};
    if (!Object.keys(dc).length) return html;

    const containerStyle = (dc.container_style || '').trim();
    const titleStyle = (dc.title_style || '').trim();
    const bubbleLeft = (dc.bubble_left_style || '').trim();
    const bubbleRight = (dc.bubble_right_style || '').trim();
    const avatarCommon = (dc.avatar_style || '').trim();
    const avatarLeft = (dc.avatar_left_style || '').trim();
    const avatarRight = (dc.avatar_right_style || '').trim();

    if (containerStyle) {
      html = html.replace(
        /<section class="dialogue-inner"[\s\S]*?mpa-from-tpl="t">/g,
        `<section class="dialogue-inner" style="${containerStyle}" mpa-from-tpl="t">`
      );
    }
    if (titleStyle) {
      html = html.replace(
        /<section class="dialogue-title"[\s\S]*?mpa-from-tpl="t">/g,
        `<section class="dialogue-title" style="${titleStyle}" mpa-from-tpl="t">`
      );
    }

    const buildBubbleReplacer = (side, themeStyle) => {
      return (match, existing) => {
        const layoutProps = [];
        for (const [pattern, prop] of [
          [/display:\s*([^;]+);?/, 'display'],
          [/vertical-align:\s*([^;]+);?/, 'vertical-align'],
          [/max-width:\s*([^;]+);?/, 'max-width'],
        ]) {
          const pm = existing.match(pattern);
          if (pm) layoutProps.push(`${prop}: ${pm[1]};`);
        }
        const merged = layoutProps.length ? layoutProps.join(' ') + ' ' + themeStyle : themeStyle;
        return `<section class="dialogue-bubble" data-dialogue-side="${side}" style="${merged}">`;
      };
    };

    if (bubbleLeft) {
      html = html.replace(
        /<section class="dialogue-bubble"\s+data-dialogue-side="left"\s+style="([\s\S]*?)">/g,
        buildBubbleReplacer('left', bubbleLeft)
      );
    }
    if (bubbleRight) {
      html = html.replace(
        /<section class="dialogue-bubble"\s+data-dialogue-side="right"\s+style="([\s\S]*?)">/g,
        buildBubbleReplacer('right', bubbleRight)
      );
    }

    if (avatarCommon) {
      const commonClean = avatarCommon.replace(/margin[^;]*;/g, '').trim();
      for (const [side, sideStyle, margin] of [['left', avatarLeft, 'margin: 0 10px 0 0;'], ['right', avatarRight, 'margin: 0 0 0 10px;']]) {
        if (!sideStyle) continue;
        const fullStyle = `${commonClean} ${sideStyle} ${margin}`;
        html = html.replace(
          new RegExp(`<section class="dialogue-avatar-inner" data-dialogue-side="${side}"[\\s\\S]*?>`, 'g'),
          `<section class="dialogue-avatar-inner" data-dialogue-side="${side}" style="${fullStyle}">`
        );
        // Extract color from side style and apply to avatar text
        const colorMatch = sideStyle.match(/(?:background-color|background):\s*([^;]+)/);
        if (colorMatch) {
          html = html.replace(
            new RegExp(`(<span class="dialogue-avatar-text"\\s+data-dialogue-side="${side}"[\\s\\S]*?style="[\\s\\S]*?)(")`, 'g'),
            `$1; color: ${avatarRight.match(/color:\s*([^;]+)/)?.[1] || '#fff'}$2`
          );
        }
      }
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

    const wm = this.watermark
      ? `<p style="text-align:center;font-size:11px;color:#bbb;margin-top:2.5em;padding-top:1em;border-top:1px solid #eee;">` +
        `Styled by <a href="https://github.com/michellewkx/inkpress" style="color:#aaa;text-decoration:none;border-bottom:1px dashed #ccc;">inkpress</a></p>`
      : '';

    return `<section style="${containerStyle}">${content}${wm}</section>`;
  }
}
