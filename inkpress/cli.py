#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
inkpress CLI - Convert Markdown to WeChat-compatible HTML.

Usage:
    inkpress convert input.md -t cyberpunk -o output.html
    inkpress themes
    inkpress themes --series oriental
    inkpress serve
"""

import argparse
import sys
import json
from pathlib import Path


def cmd_convert(args):
    from .core import convert, convert_to_file

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    md_text = input_path.read_text(encoding="utf-8")

    if args.output:
        output_path = args.output
    else:
        output_path = str(input_path.with_suffix(".html"))

    convert_to_file(md_text, output_path, theme=args.theme)
    print(f"Done: {output_path} (theme: {args.theme})")


def cmd_themes(args):
    from .renderer.theme_loader import get_theme_loader

    loader = get_theme_loader()

    if args.series:
        by_series = loader.list_themes_by_series()
        series_data = by_series.get(args.series, [])
        if not series_data:
            print(f"No themes in series '{args.series}'")
            print(f"Available series: {', '.join(by_series.keys())}")
            return
        print(f"\n  {args.series.upper()} series:\n")
        for t in series_data:
            tags = " ".join(f"[{tag}]" for tag in t["tags"]) if t["tags"] else ""
            print(f"    {t['name']:20s} {t['display_name']} - {t['description']} {tags}")
    elif args.json:
        themes = loader.list_themes()
        print(json.dumps(themes, ensure_ascii=False, indent=2))
    else:
        by_series = loader.list_themes_by_series()
        if not by_series:
            print("No themes found.")
            return
        for series_name, themes in sorted(by_series.items()):
            print(f"\n  {series_name.upper()}:")
            for t in themes:
                print(f"    {t['name']:20s} {t['description']}")
        print()


def cmd_serve(args):
    try:
        import uvicorn
    except ImportError:
        print("Error: uvicorn not installed. Run: pip install uvicorn fastapi", file=sys.stderr)
        sys.exit(1)

    from .server import create_app
    app = create_app()
    print(f"inkpress server starting at http://localhost:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)


def main():
    parser = argparse.ArgumentParser(
        prog="inkpress",
        description="inkpress - Markdown to WeChat HTML with beautiful themes",
    )
    parser.add_argument("--version", action="version", version="%(prog)s 0.1.0")
    subparsers = parser.add_subparsers(dest="command")

    # convert
    p_convert = subparsers.add_parser("convert", help="Convert Markdown to HTML")
    p_convert.add_argument("input", help="Input Markdown file")
    p_convert.add_argument("-t", "--theme", default="default", help="Theme name (default: default)")
    p_convert.add_argument("-o", "--output", help="Output HTML file (default: input.html)")

    # themes
    p_themes = subparsers.add_parser("themes", help="List available themes")
    p_themes.add_argument("-s", "--series", help="Filter by series (e.g. oriental, tech)")
    p_themes.add_argument("--json", action="store_true", help="Output as JSON")

    # serve
    p_serve = subparsers.add_parser("serve", help="Start local preview server")
    p_serve.add_argument("-p", "--port", type=int, default=8089, help="Port (default: 8089)")
    p_serve.add_argument("--host", default="127.0.0.1", help="Host (default: 127.0.0.1)")

    args = parser.parse_args()

    if args.command == "convert":
        cmd_convert(args)
    elif args.command == "themes":
        cmd_themes(args)
    elif args.command == "serve":
        cmd_serve(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
