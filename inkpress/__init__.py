# -*- coding: utf-8 -*-
"""
inkpress - Markdown to WeChat HTML converter with beautiful themes

Usage:
    from inkpress import convert

    # Basic
    html = convert("# Title\nContent here")

    # With theme
    html = convert(markdown_text, theme="cyberpunk")

    # List themes
    from inkpress import list_themes
    print(list_themes())
"""

from .core import (
    convert,
    convert_to_file,
    list_themes,
    get_theme_info,
    MarkdownConverter,
)

__version__ = "0.1.0"
__all__ = [
    "convert",
    "convert_to_file",
    "list_themes",
    "get_theme_info",
    "MarkdownConverter",
]
