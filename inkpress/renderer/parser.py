# -*- coding: utf-8 -*-
"""
Markdown preprocessor for WeChat-specific syntax extensions.

Handles:
- Strikethrough (~~text~~)
- GFM Alerts (> [!NOTE])
- Gallery (:::gallery)
- Long image (:::longimage)
- Dialogue (:::dialogue)
"""

import re
import markdown
from typing import Tuple

# Pre-compiled patterns
ALERT_PATTERN = re.compile(r"^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]")
IMAGE_PATTERN = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
DIALOGUE_PATTERN = re.compile(r"^([^:：]+)[:：](.+)$")
UNWRAP_P_PATTERN = re.compile(r"^<p>(.*)</p>$", re.DOTALL)
LIST_ITEM_PATTERN = re.compile(r"^\s*[\*\-\+] |\s*\d+\.")

ALERT_TYPES = {
    "NOTE": ("提示", "#1677ff", "📌"),
    "TIP": ("技巧", "#52c41a", "💡"),
    "IMPORTANT": ("重要", "#fa8c16", "⚠️"),
    "WARNING": ("警告", "#f5222d", "🔔"),
    "CAUTION": ("注意", "#a0d911", "⚡"),
}


def unwrap_p_tag(html: str) -> str:
    return UNWRAP_P_PATTERN.sub(r"\1", html)


def hex_to_rgb(hex_color: str) -> str:
    hex_color = hex_color.lstrip("#")
    return f"{int(hex_color[0:2], 16)}, {int(hex_color[2:4], 16)}, {int(hex_color[4:6], 16)}"


def _build_alert_html(alert_color: str, alert_icon: str, alert_label: str, content_html: str) -> str:
    return f"""
<div style="margin: 1.5em 0; padding: 12px 16px; border-left: 4px solid {alert_color};
            background: rgba({hex_to_rgb(alert_color)}, 0.05); border-radius: 4px;">
  <div style="color: {alert_color}; font-weight: 600; margin-bottom: 8px;
            display: flex; align-items: center; gap: 6px;">
    <span>{alert_icon}</span>
    <span>{alert_label}</span>
  </div>
  <div style="color: #555; line-height: 1.6;">{content_html}</div>
</div>"""


def _build_avatar_section(position_marker: str, speaker: str) -> str:
    initial = speaker[0] if speaker else "U"
    return f"""
            <section class="dialogue-avatar" {position_marker}
                    style="display: inline-block; vertical-align: top; width: 40px;
                           height: 40px; box-sizing: border-box; position: relative; flex-shrink: 0;">
              <section class="dialogue-avatar-inner" {position_marker}
                      style="width: 40px; height: 40px; border-radius: 50%;
                             text-align: center; line-height: 40px; font-size: 13px;
                             font-weight: 600; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                             box-sizing: border-box;">
                <span class="dialogue-avatar-text" {position_marker}
                      style="font-size: 13px; font-weight: 600;" leaf="">{initial}</span>
              </section>
            </section>"""


def _build_bubble_section(position_marker: str, text: str) -> str:
    return f"""
            <section class="dialogue-bubble" {position_marker}
                    style="display: inline-block; vertical-align: top;
                           padding: 10px 14px; max-width: 65%; color: inherit;
                           line-height: 1.5; font-size: 14px;
                           box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                           word-wrap: break-word; box-sizing: border-box; text-align: left;">
              <p style="margin: 0px; color: inherit; line-height: 1.5;
                     font-size: 14px; text-align: left; box-sizing: border-box;">
                <span leaf="">{text}</span>
              </p>
            </section>"""


def _build_dialogue_html(title: str, messages: list) -> str:
    messages_html = []
    for i, (speaker, text) in enumerate(messages):
        is_right = i % 2 == 1
        side = "right" if is_right else "left"
        position_marker = f'data-dialogue-side="{side}"'
        avatar = _build_avatar_section(position_marker, speaker)
        bubble = _build_bubble_section(position_marker, text)
        inner = (bubble + avatar) if is_right else (avatar + bubble)
        align = "text-align: right;" if is_right else "text-align: left;"
        padding = "padding-right: 0px;" if is_right else "padding-left: 0px;"
        messages_html.append(f"""
  <section style="margin: 12px 0px; box-sizing: border-box; clear: both;">
    <section style="{align} box-sizing: border-box; {padding}">
      {inner}
    </section>
  </section>""")

    return f"""
<section class="dialogue-container" data-mpa-template="t"
         mpa-data-temp-power-by="inkpress" mpa-from-tpl="t"
         data-mpa-action-id="dialogue">
<section data-mpa-template="t" mpa-from-tpl="t">
<section style="box-sizing: border-box; width: 100%;" mpa-from-tpl="t">
<section style="box-sizing: border-box; width: 100%;" mpa-from-tpl="t">
<section class="dialogue-inner"
        style="margin: 12px 8px 16px; padding: 12px; border-radius: 12px;
               box-sizing: border-box;" mpa-from-tpl="t">
<section style="margin: 0px; padding: 0px; box-sizing: border-box;" mpa-from-tpl="t">
<section class="dialogue-title"
        style="text-align: center; font-size: 16px; font-weight: 600;
               margin-bottom: 12px; padding-bottom: 8px;
               border-bottom: 1px solid; letter-spacing: 0.5px;
               box-sizing: border-box;" mpa-from-tpl="t">
<p style="margin: 0px; text-align: center; box-sizing: border-box;">
<span class="dialogue-title-text" style="font-size: 16px; font-weight: 600;" leaf="">💬 {title}</span>
</p>
</section>
<section style="margin: 0px; padding: 0px; box-sizing: border-box;" mpa-from-tpl="t">
{"".join(messages_html)}
</section>
</section>
</section>
</section>
</section>
</section>
</section>"""


def preprocess_markdown(text: str) -> Tuple[str, dict]:
    """
    Preprocess Markdown text, handle custom syntax extensions.

    Returns: (processed_text, placeholder_dict)
    """
    placeholders = {}
    counter = [0]

    def make_placeholder(html_content: str) -> str:
        key = f"INKPRESS_HTML_BLOCK_{counter[0]}"
        counter[0] += 1
        placeholders[key] = html_content
        return key

    def process_strikethrough(text: str) -> str:
        return re.sub(r"~~(.+?)~~", r"<del>\1</del>", text)

    def process_lists_with_prefix(text: str) -> str:
        lines = text.split("\n")
        result = []
        for i, line in enumerate(lines):
            if i > 0 and LIST_ITEM_PATTERN.match(line):
                prev = lines[i - 1]
                if prev.strip() and not LIST_ITEM_PATTERN.match(prev):
                    result.append("")
            result.append(line)
        return "\n".join(result)

    def process_gfm_with_placeholder(text: str) -> str:
        lines = text.split("\n")
        result = []
        i = 0
        while i < len(lines):
            alert_match = ALERT_PATTERN.match(lines[i])
            if alert_match:
                alert_type = alert_match.group(1)
                alert_label, alert_color, alert_icon = ALERT_TYPES[alert_type]
                alert_content = []
                i += 1
                while i < len(lines) and lines[i].startswith(">"):
                    alert_content.append(lines[i][1:].strip())
                    i += 1
                content_html = unwrap_p_tag(markdown.markdown("\n".join(alert_content)))
                result.append(make_placeholder(_build_alert_html(alert_color, alert_icon, alert_label, content_html)))
            else:
                result.append(lines[i])
                i += 1
        return "\n".join(result)

    def process_gallery_with_placeholder(text: str) -> str:
        def replace(m):
            images = IMAGE_PATTERN.findall(m.group(2))
            if not images:
                return ""
            images_html = "\n".join(
                f'<div style="flex: 0 0 auto; width: 280px; height: 200px; '
                f'margin-right: 12px; border-radius: 8px; overflow: hidden;">'
                f'<img src="{url}" alt="{alt}" style="width: 100%; height: 100%; object-fit: cover;"></div>'
                for alt, url in images
            )
            title = m.group(1)
            return make_placeholder(f"""
<div style="margin: 2em 0; padding: 16px; background: #f5f5f5; border-radius: 8px;">
  <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333;">📷 {title}</div>
  <div style="display: flex; overflow-x: auto; padding-bottom: 8px;
            scrollbar-width: none; -webkit-overflow-scrolling: touch;">
    {images_html}
  </div>
</div>""")

        return re.sub(r":::gallery\[([^\]]*)\](.*?):::", replace, text, flags=re.DOTALL)

    def process_long_image_with_placeholder(text: str) -> str:
        def replace(m):
            img_match = IMAGE_PATTERN.search(m.group(2))
            if not img_match:
                return ""
            alt, url = img_match.groups()
            title = m.group(1)
            return make_placeholder(f"""
<div style="margin: 2em 0; padding: 16px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e8e8e8;">
  <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333;">📋 {title}</div>
  <div style="max-height: 600px; overflow-y: auto; text-align: center;">
    <img src="{url}" alt="{alt}" style="max-width: 100%; height: auto; border-radius: 4px;">
  </div>
</div>""")

        return re.sub(r":::longimage\[([^\]]*)\](.*?):::", replace, text, flags=re.DOTALL)

    def process_dialogue_with_placeholder(text: str) -> str:
        def replace(m):
            lines = [line.strip() for line in m.group(2).strip().split("\n") if line.strip()]
            messages = []
            for line in lines:
                dm = DIALOGUE_PATTERN.match(line)
                if dm:
                    messages.append((dm.group(1).strip(), dm.group(2).strip()))
            if not messages:
                return ""
            return make_placeholder(_build_dialogue_html(m.group(1), messages))

        return re.sub(r":::dialogue\[([^\]]*)\](.*?):::", replace, text, flags=re.DOTALL)

    result = text
    result = process_strikethrough(result)
    result = process_lists_with_prefix(result)
    result = process_gfm_with_placeholder(result)
    result = process_gallery_with_placeholder(result)
    result = process_long_image_with_placeholder(result)
    result = process_dialogue_with_placeholder(result)

    return result, placeholders
