# -*- coding: utf-8 -*-
"""
inkpress core module
"""

from pathlib import Path
from typing import Optional, Dict
from .renderer.theme_loader import get_theme_loader, ThemeLoader
from .renderer.engine import InkpressRenderer


def convert(markdown_text: str, theme: str = "default") -> str:
    """
    Convert Markdown to WeChat-compatible HTML.

    Args:
        markdown_text: Markdown content
        theme: Theme name (e.g. default, cyberpunk, chinese-ink)

    Returns:
        Full HTML string with inline styles

    Raises:
        ValueError: If theme does not exist
    """
    loader = get_theme_loader()
    config = loader.load_raw_theme(theme)
    renderer = InkpressRenderer(config=config)
    return renderer.render(markdown_text)


def convert_to_file(
    markdown_text: str,
    output_path: str,
    theme: str = "default",
    encoding: str = "utf-8",
) -> str:
    """
    Convert Markdown to HTML and save to file.

    Returns:
        The output file path
    """
    html = convert(markdown_text, theme=theme)
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding=encoding) as f:
        f.write(html)
    return str(output_file)


def list_themes() -> Dict[str, str]:
    """List all available themes. Returns {name: description}."""
    loader = get_theme_loader()
    return loader.list_themes()


def get_theme_info(theme_name: str) -> Dict[str, str]:
    """Get theme metadata."""
    loader = get_theme_loader()
    return loader.get_theme_info(theme_name)


class MarkdownConverter:
    """
    Object-oriented interface for repeated conversions.

    Example:
        converter = MarkdownConverter(theme="cyberpunk")
        html1 = converter.convert("Content 1")
        converter.set_theme("chinese-ink")
        html2 = converter.convert("Content 2")
    """

    def __init__(self, theme: str = "default"):
        self.theme = theme
        self._init_renderer()

    def _init_renderer(self):
        loader = get_theme_loader()
        config = loader.load_raw_theme(self.theme)
        self._renderer = InkpressRenderer(config=config)

    def set_theme(self, theme: str) -> None:
        self.theme = theme
        self._init_renderer()

    def convert(self, markdown_text: str) -> str:
        return self._renderer.render(markdown_text)

    def convert_to_file(
        self, markdown_text: str, output_path: str, encoding: str = "utf-8"
    ) -> str:
        html = self.convert(markdown_text)
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, "w", encoding=encoding) as f:
            f.write(html)
        return str(output_file)
