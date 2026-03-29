# -*- coding: utf-8 -*-
"""
inkpress HTML rendering engine.
Converts parsed Markdown HTML to WeChat-compatible HTML with inline styles.
Supports theme decorations (prefixes, suffixes, custom hr text).
"""

import re
import html as html_module
import markdown
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
from pygments.util import ClassNotFound
from typing import Dict

UL_PREFIX_PATTERN = re.compile(r"^[\*\-\+•]\s+")
OL_PREFIX_PATTERN = re.compile(r"^\d+\.\s+")


class InkpressRenderer:
    """HTML renderer with YAML theme support and decorations."""

    def __init__(self, config: Dict):
        self.config = config
        self.decorations = config.get("decorations", {})
        self.md = markdown.Markdown(
            extensions=["tables", "fenced_code", "codehilite", "toc", "attr_list", "md_in_html", "extra"],
            extension_configs={"codehilite": {"linenums": False, "guess_lang": False}},
        )

    def render(self, markdown_text: str, watermark: bool = True) -> str:
        from .parser import preprocess_markdown

        processed, placeholders = preprocess_markdown(markdown_text)
        html_content = self.md.convert(processed)
        self.md.reset()

        for placeholder, html in placeholders.items():
            html_content = re.sub(rf"<p>\s*{re.escape(placeholder)}\s*</p>", html, html_content)
            html_content = html_content.replace(placeholder, html)

        return self._wrap_html(self._apply_styles(html_content), watermark=watermark)

    def _get_style(self, element: str) -> str:
        element_config = self.config.get(element, {})
        if isinstance(element_config, str):
            return element_config
        return element_config.get("style", "")

    def _get_decoration(self, key: str, default: str = "") -> str:
        return self.decorations.get(key, default)

    def _apply_styles(self, html: str) -> str:
        html = self._style_headings(html)
        html = self._style_paragraphs(html)
        html = self._style_lists(html)
        html = self._style_code_blocks(html)
        html = self._style_inline_code(html)
        html = self._style_blockquotes(html)
        html = self._style_footnotes(html)
        html = self._style_gfm_alerts(html)
        html = self._style_links(html)
        html = self._style_images(html)
        html = self._style_tables(html)
        html = self._style_hr(html)
        html = self._style_emphasis(html)
        html = self._style_dialogue(html)
        return html

    def _style_headings(self, html: str) -> str:
        for level in range(1, 7):
            style = self._get_style(f"h{level}")
            prefix = self._get_decoration(f"h{level}_prefix", "")
            if style or prefix:
                def make_replacer(s, p):
                    def replacer(m):
                        content = m.group(1)
                        if p:
                            content = f"{p}{content}"
                        style_attr = f' style="{s}"' if s else ""
                        return f"<h{m.group(2)}{style_attr}>{content}</h{m.group(2)}>"
                    return replacer
                html = re.sub(
                    rf"<h({level})[^>]*>(.*?)</h\1>",
                    lambda m, s=style, p=prefix: f'<h{m.group(1)} style="{s}">{p}{m.group(2)}</h{m.group(1)}>',
                    html,
                )
        return html

    def _style_paragraphs(self, html: str) -> str:
        style = self._get_style("paragraph")
        if style:
            html = re.sub(
                r"<p>(?!\s*<figure)(.*?)</p>",
                f'<p style="{style}">\\1</p>',
                html,
                flags=re.DOTALL,
            )
        return html

    def _style_lists(self, html: str) -> str:
        list_config = self.config.get("list", {})
        container_style = list_config.get("container_style", "").strip()
        item_style = list_config.get("item_style", "").strip()
        ul_prefix = list_config.get("ul_prefix", "• ")
        ol_prefix = list_config.get("ol_prefix", "{n}. ")
        nested_container_style = list_config.get("nested_container_style", "").strip()
        nested_item_style = list_config.get("nested_item_style", "").strip() or item_style
        nested_ul_prefix = list_config.get("nested_ul_prefix", "◦ ")

        if not container_style:
            return html

        def find_matching_close(s, tag, start):
            open_tag = f"<{tag}"
            close_tag = f"</{tag}>"
            depth = 1
            pos = start
            while depth > 0 and pos < len(s):
                next_open = s.find(open_tag, pos)
                next_close = s.find(close_tag, pos)
                if next_close == -1:
                    break
                if next_open != -1 and next_open < next_close:
                    depth += 1
                    pos = next_open + len(open_tag)
                else:
                    depth -= 1
                    if depth == 0:
                        return next_close
                    pos = next_close + len(close_tag)
            return -1

        def style_list(content, tag, is_nested=False):
            cs = nested_container_style if (is_nested and nested_container_style) else container_style
            ist = nested_item_style if is_nested else item_style

            # Extract <li> blocks using tag counting (handles nested <li> inside sublists)
            li_blocks = []
            search_pos = 0
            while True:
                li_start = content.find("<li>", search_pos)
                if li_start == -1:
                    break
                inner_start = li_start + 4
                li_end = find_matching_close(content, "li", inner_start)
                if li_end == -1:
                    break
                li_blocks.append(content[inner_start:li_end])
                search_pos = li_end + 5  # len("</li>")

            items_html = []
            for counter, li_text in enumerate(li_blocks):
                li_text = li_text.strip()

                # Extract nested sublists before cleaning
                nested_html = ""
                for nested_tag in ("ul", "ol"):
                    nested_open = f"<{nested_tag}>"
                    idx = li_text.find(nested_open)
                    if idx != -1:
                        end_idx = find_matching_close(li_text, nested_tag, idx + len(nested_open))
                        if end_idx != -1:
                            nested_content = li_text[idx + len(nested_open):end_idx]
                            nested_html = style_list(nested_content, nested_tag, is_nested=True)
                            li_text = li_text[:idx] + li_text[end_idx + len(f"</{nested_tag}>"):]

                li_text = re.sub(r"<p[^>]*>(.*?)</p>", r"\1", li_text, flags=re.DOTALL).strip()
                li_text = UL_PREFIX_PATTERN.sub("", li_text)
                li_text = OL_PREFIX_PATTERN.sub("", li_text)

                if tag == "ul":
                    pfx = nested_ul_prefix if is_nested else ul_prefix
                else:
                    pfx = ol_prefix.replace("{n}", str(counter + 1))

                li_out = f'  <li style="{ist}">{pfx}{li_text}'
                if nested_html:
                    li_out += f"\n{nested_html}"
                li_out += "</li>"
                items_html.append(li_out)

            return f'<{tag} style="{cs}">\n' + "\n".join(items_html) + f"\n</{tag}>"

        # Process top-level UL blocks
        pos = 0
        while True:
            idx = html.find("<ul>", pos)
            if idx == -1:
                break
            end_idx = find_matching_close(html, "ul", idx + 4)
            if end_idx == -1:
                break
            inner = html[idx + 4:end_idx]
            replacement = style_list(inner, "ul", is_nested=False)
            html = html[:idx] + replacement + html[end_idx + 5:]
            pos = idx + len(replacement)

        # Process top-level OL blocks
        pos = 0
        while True:
            idx = html.find("<ol>", pos)
            if idx == -1:
                break
            # Skip footnote <ol> (inside doc-footnotes section)
            if 'role="doc-footnotes"' in html[max(0, idx - 200):idx]:
                pos = idx + 4
                continue
            end_idx = find_matching_close(html, "ol", idx + 4)
            if end_idx == -1:
                break
            inner = html[idx + 4:end_idx]
            replacement = style_list(inner, "ol", is_nested=False)
            html = html[:idx] + replacement + html[end_idx + 5:]
            pos = idx + len(replacement)

        return html

    def _style_code_blocks(self, html: str) -> str:
        code_config = self.config.get("code_block", {})
        style = code_config.get("style", "")
        code_style = code_config.get("code_inner_style", "")

        html = re.sub(
            r'<pre><code class="language-(.*?)">(.*?)</code></pre>',
            self._highlight_code,
            html,
            flags=re.DOTALL,
        )
        if style:
            html = re.sub(r"<pre(?![^>]*style=)(.*?)>", f'<pre style="{style}"\\1>', html)
        if code_style:
            html = re.sub(r"<code(?![^>]*style=)([^>]*?)>", f'<code style="{code_style}"\\1>', html)
        return html

    def _highlight_code(self, match) -> str:
        lang = match.group(1)
        code = html_module.unescape(match.group(2))
        code_config = self.config.get("code_block", {})
        style = code_config.get("style", "")
        code_style = code_config.get("code_inner_style", "")
        try:
            lexer = get_lexer_by_name(lang)
            highlighted = highlight(code, lexer, HtmlFormatter(style="github", noclasses=True))
            return f'<pre style="{style}"><code style="{code_style}">{highlighted}</code></pre>'
        except ClassNotFound:
            return f'<pre style="{style}"><code style="{code_style}">{code}</code></pre>'

    def _style_inline_code(self, html: str) -> str:
        style = self._get_style("inline_code")
        if style:
            html = re.sub(r"<code(?![^>]*style=)([^>]*?)>", f'<code style="{style}"\\1>', html)
        return html

    def _style_blockquotes(self, html: str) -> str:
        blockquote_config = self.config.get("blockquote", {})
        style = blockquote_config.get("style", "")
        p_style = blockquote_config.get("p_inner_style", "")
        prefix = self._get_decoration("blockquote_prefix", "")
        suffix = self._get_decoration("blockquote_suffix", "")

        if not style:
            return html

        def replace_blockquote(m):
            content = m.group(1)
            if p_style:
                content = re.sub(r"<p[^>]*>(.*?)</p>", f'<p style="{p_style}">\\1</p>', content, flags=re.DOTALL)
            if prefix or suffix:
                content = re.sub(
                    r"(<p[^>]*>)(.*?)(</p>)",
                    lambda pm: f"{pm.group(1)}{prefix}{pm.group(2)}{suffix}{pm.group(3)}",
                    content,
                    flags=re.DOTALL,
                )
            return f'<blockquote style="{style}">{content}</blockquote>'

        return re.sub(r"<blockquote>(.*?)</blockquote>", replace_blockquote, html, flags=re.DOTALL)

    def _style_footnotes(self, html: str) -> str:
        fn_config = self.config.get("footnote", {})
        if not fn_config:
            return html

        sup_style = fn_config.get("sup_style", "").strip()
        ref_style = fn_config.get("ref_style", "").strip()
        section_style = fn_config.get("section_style", "").strip()
        list_style = fn_config.get("list_style", "").strip()
        item_style = fn_config.get("item_style", "").strip()
        backref_style = fn_config.get("backref_style", "").strip()

        # Style footnote sup references
        if sup_style:
            html = re.sub(r'<sup id="fnref:', f'<sup style="{sup_style}" id="fnref:', html)

        # Style and reformat footnote ref anchors: "1" -> "[1]"
        if ref_style:
            html = re.sub(
                r'<a class="footnote-ref" href="([^"]+)">(\d+)</a>',
                f'<a href="\\1" style="{ref_style}">[\\2]</a>',
                html,
            )

        # Transform footnote section: <div class="footnote"><hr /> -> <section role="doc-footnotes">
        if section_style:
            html = re.sub(
                r'<div class="footnote">\s*<hr\s*/?>',
                f'<section role="doc-footnotes" style="{section_style}">',
                html,
                flags=re.DOTALL,
            )
            html = re.sub(r"</ol>\s*</div>\s*$", "</ol>\n</section>", html)

        # Style footnote ol
        if list_style:
            html = re.sub(
                r'(<section role="doc-footnotes"[^>]*>)\s*<ol>',
                f"\\1\n<ol style=\"{list_style}\">",
                html,
            )

        # Style footnote li items
        if item_style:
            html = re.sub(r'<li id="fn:(\d+)">', f'<li id="fn:\\1" style="{item_style}">', html)

        # Style backref anchors
        if backref_style:
            html = re.sub(
                r'<a class="footnote-backref"([^>]*)>',
                f'<a class="footnote-backref" style="{backref_style}"\\1>',
                html,
            )

        return html

    def _style_gfm_alerts(self, html: str) -> str:
        alert_config = self.config.get("gfm_alert", {})
        container_style = alert_config.get(
            "container_style", "margin: 1.5em 0; padding: 12px 16px; border-radius: 4px;"
        ).strip()
        title_style = alert_config.get(
            "title_style",
            "font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;",
        ).strip()
        content_style = alert_config.get("content_style", "color: #555; line-height: 1.6;").strip()

        default_colors = {
            "NOTE": "#1677ff",
            "TIP": "#52c41a",
            "IMPORTANT": "#fa8c16",
            "WARNING": "#f5222d",
            "CAUTION": "#a0d911",
        }

        for alert_type, default_color in default_colors.items():
            color = alert_config.get(f"{alert_type.lower()}_color", default_color)
            hex_color = color.lstrip("#")
            rgb = f"{int(hex_color[0:2], 16)}, {int(hex_color[2:4], 16)}, {int(hex_color[4:6], 16)}"

            type_container = f"{container_style} border-left: 4px solid {color}; background: rgba({rgb}, 0.05);"
            type_title = f"{title_style} color: {color};"

            html = re.sub(
                f'<div data-inkpress-alert="{alert_type}" data-alert-color="[^"]*">',
                f'<div style="{type_container}">',
                html,
            )
            html = re.sub(
                f'<div data-inkpress-alert-title="{alert_type}">',
                f'<div style="{type_title}">',
                html,
            )
            html = re.sub(
                f'<div data-inkpress-alert-content="{alert_type}">',
                f'<div style="{content_style}">',
                html,
            )

        return html

    def _style_links(self, html: str) -> str:
        style = self._get_style("link")
        if style:
            html = re.sub(r"<a(?![^>]*style=)([^>]*?)>", f'<a style="{style}"\\1>', html)
        return html

    def _style_images(self, html: str) -> str:
        image_config = self.config.get("image", {})
        container_style = image_config.get("container_style", "")
        img_style = image_config.get("img_style", "")
        caption_style = image_config.get("caption_style", "").strip()

        if container_style:
            def replace_image(m):
                img_tag = m.group(1)
                alt_match = re.search(r'alt="([^"]*)"', img_tag)
                alt_text = alt_match.group(1) if alt_match else ""
                caption_html = ""
                if caption_style and alt_text:
                    caption_html = f'<figcaption style="{caption_style}">{alt_text}</figcaption>'
                return f'<figure style="{container_style}">{img_tag}{caption_html}</figure>'

            html = re.sub(
                r"<p[^>]*>\s*(<img[^>]+>)\s*</p>",
                replace_image,
                html,
            )
        if img_style:
            html = re.sub(r"<img(?![^>]*style=)([^>]*?)>", f'<img style="{img_style}"\\1>', html)
        return html

    def _style_tables(self, html: str) -> str:
        table_config = self.config.get("table", {})
        style = table_config.get("style", "")
        th_style = table_config.get("th_style", "")
        td_style = table_config.get("td_style", "")
        tr_odd_style = table_config.get("tr_odd_style", "").strip()
        wrapper_style = table_config.get("wrapper_style", "").strip()

        if style:
            html = re.sub(r"<table\b[^>]*>", f'<table style="{style}">', html)
        if th_style:
            html = re.sub(r"<th\b[^>]*>", f'<th style="{th_style}">', html)
        if td_style:
            html = re.sub(r"<td\b[^>]*>", f'<td style="{td_style}">', html)

        # Zebra striping: add tr_odd_style to <td> in odd rows (0-indexed: 0, 2, 4...)
        if tr_odd_style:
            def add_zebra(m):
                tbody_content = m.group(1)
                rows = re.findall(r"<tr>(.*?)</tr>", tbody_content, re.DOTALL)
                styled_rows = []
                for i, row_content in enumerate(rows):
                    if i % 2 == 0:
                        row_content = re.sub(
                            r'<td([^>]*?)style="([^"]*)"',
                            lambda dm: f'<td{dm.group(1)}style="{dm.group(2)} {tr_odd_style}"',
                            row_content,
                        )
                    styled_rows.append(f"<tr>{row_content}</tr>")
                return "<tbody>" + "\n".join(styled_rows) + "</tbody>"

            html = re.sub(r"<tbody>(.*?)</tbody>", add_zebra, html, flags=re.DOTALL)

        # Wrap tables in a div for overflow handling
        if wrapper_style:
            html = re.sub(
                r"(<table[^>]*>.*?</table>)",
                f'<div style="{wrapper_style}">\\1</div>',
                html,
                flags=re.DOTALL,
            )

        return html

    def _style_hr(self, html: str) -> str:
        style = self._get_style("hr")
        hr_text = self._get_decoration("hr_text", "")

        if hr_text:
            # Replace <hr> with centered decorative text
            hr_html = (
                f'<p style="text-align: center; margin: 2em 0; color: #999; '
                f'font-size: 14px; letter-spacing: 0.3em;">{hr_text}</p>'
            )
            html = re.sub(r"<hr[^>]*>", hr_html, html)
        elif style:
            html = re.sub(r"<hr[^>]*>", f'<hr style="{style}">', html)
        return html

    def _style_emphasis(self, html: str) -> str:
        bold_style = self._get_style("bold")
        italic_style = self._get_style("italic")
        strikethrough_style = self._get_style("strikethrough")

        if bold_style:
            html = re.sub(r"<strong(?![^>]*style=)([^>]*?)>", f'<strong style="{bold_style}"\\1>', html)
            html = re.sub(r"<b(?![^>]*style=)([^>]*?)>", f'<b style="{bold_style}"\\1>', html)

        if italic_style:
            html = re.sub(r"<em(?![^>]*style=)([^>]*?)>", f'<em style="{italic_style}"\\1>', html)
            html = re.sub(r"<i(?![^>]*style=)([^>]*?)>", f'<i style="{italic_style}"\\1>', html)

        if strikethrough_style:
            html = re.sub(r"<del(?![^>]*style=)([^>]*?)>", f'<del style="{strikethrough_style}"\\1>', html)
            html = re.sub(r"<s(?=\s|>)(?![^>]*style=)([^>]*?)>", f'<s style="{strikethrough_style}"\\1>', html)
            html = re.sub(r"<strike(?![^>]*style=)([^>]*?)>", f'<strike style="{strikethrough_style}"\\1>', html)

        return html

    def _style_dialogue(self, html: str) -> str:
        dialogue_config = self.config.get("dialogue", {})
        if not dialogue_config:
            return html

        container_style = dialogue_config.get("container_style", "").strip()
        title_style = dialogue_config.get("title_style", "").strip()
        bubble_left = dialogue_config.get("bubble_left_style", "").strip()
        bubble_right = dialogue_config.get("bubble_right_style", "").strip()
        avatar_common = dialogue_config.get("avatar_style", "").strip()
        avatar_left = dialogue_config.get("avatar_left_style", "").strip()
        avatar_right = dialogue_config.get("avatar_right_style", "").strip()

        if container_style:
            html = re.sub(
                r'<section class="dialogue-inner"[\s\S]*?mpa-from-tpl="t">',
                f'<section class="dialogue-inner" style="{container_style}" mpa-from-tpl="t">',
                html,
            )

        if title_style:
            html = re.sub(
                r'<section class="dialogue-title"[\s\S]*?mpa-from-tpl="t">',
                f'<section class="dialogue-title" style="{title_style}" mpa-from-tpl="t">',
                html,
            )

        def _build_bubble_replacer(side: str, theme_style: str):
            def replacer(m):
                existing = m.group(1)
                layout_props = []
                for prop, pattern in [
                    ("display", r"display:\s*([^;]+)"),
                    ("vertical-align", r"vertical-align:\s*([^;]+)"),
                ]:
                    pm = re.search(pattern, existing)
                    if pm:
                        layout_props.append(f"{prop}: {pm.group(1)};")
                merged = (" ".join(layout_props) + " " + theme_style) if layout_props else theme_style
                return f'<section class="dialogue-bubble" data-dialogue-side="{side}" style="{merged}">'
            return replacer

        if bubble_left:
            html = re.sub(
                r'<section class="dialogue-bubble"\s+data-dialogue-side="left"\s+style="([\s\S]*?)">',
                _build_bubble_replacer("left", bubble_left),
                html,
            )

        if bubble_right:
            html = re.sub(
                r'<section class="dialogue-bubble"\s+data-dialogue-side="right"\s+style="([\s\S]*?)">',
                _build_bubble_replacer("right", bubble_right),
                html,
            )

        if avatar_common:
            common_clean = re.sub(r"margin:\s*[^;]+;\s*", "", avatar_common)
            for side, side_style, margin in [
                ("left", avatar_left, "margin: 0 8px 0 0;"),
                ("right", avatar_right, "margin: 0 0 0 8px;"),
            ]:
                if not side_style:
                    continue
                full_style = f"{common_clean} {side_style} {margin}"
                html = re.sub(
                    rf'<section class="dialogue-avatar-inner" data-dialogue-side="{side}"[\s\S]*?>',
                    f'<section class="dialogue-avatar-inner" data-dialogue-side="{side}" style="{full_style}">',
                    html,
                )
                color = self._extract_color(side_style)
                if color:
                    avatar_text_pattern = (
                        rf'(<span class="dialogue-avatar-text"\s+data-dialogue-side="{side}"'
                        r'[\s\S]*?style="[\s\S]*?)(")'
                    )
                    html = re.sub(avatar_text_pattern, f"\\1; color: {color}\\2", html)

        return html

    def _extract_color(self, style_str: str) -> str:
        match = re.search(r"color:\s*([^;]+)", style_str)
        return match.group(1).strip() if match else ""

    def _wrap_html(self, content: str, watermark: bool = True) -> str:
        container_config = self.config.get("container", {})
        body_config = self.config.get("body", {})

        max_width = container_config.get("max_width", "677px")
        padding = container_config.get("padding", "8px")
        background = container_config.get("background", "#ffffff")
        border_radius = container_config.get("border_radius", "12px")
        box_shadow = container_config.get("box_shadow", "")
        body_bg = body_config.get("background", "#f9f9f9")
        body_padding = body_config.get("padding", "16px")

        para_style = self._get_style("paragraph")
        global_props = {}
        for prop in ("font-family", "color", "line-height", "font-size"):
            m = re.search(rf"{prop}:\s*([^;]+)", para_style)
            if m:
                global_props[prop] = m.group(1).strip()

        container_style = (
            f"max-width: {max_width}; margin: 0 auto; padding: {padding}; "
            f"background-color: {background};"
        )
        for prop, val in global_props.items():
            container_style += f" {prop}: {val};"
        container_style += f" border-radius: {border_radius};"
        if box_shadow:
            container_style += f" box-shadow: {box_shadow};"

        watermark_html = ""
        if watermark:
            watermark_html = (
                '\n  <p style="text-align: center; font-size: 11px; color: #bbb; '
                'margin-top: 2.5em; padding-top: 1em; border-top: 1px solid #eee;">'
                'Styled by <a href="https://github.com/michellewkx/inkpress" '
                'style="color: #aaa; text-decoration: none; border-bottom: 1px dashed #ccc;">'
                'inkpress</a></p>'
            )

        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>inkpress</title>
</head>
<body style="margin: 0; padding: {body_padding}; background-color: {body_bg};">
  <section style="{container_style}">
    {content}{watermark_html}
  </section>
</body>
</html>"""
