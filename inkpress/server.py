# -*- coding: utf-8 -*-
"""
inkpress FastAPI server for local preview and API access.
"""

from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional


class ConvertRequest(BaseModel):
    markdown: str
    theme: str = "default"
    watermark: bool = True


def create_app() -> FastAPI:
    from .core import convert, list_themes, get_theme_info

    app = FastAPI(title="inkpress", version="0.1.0")

    @app.get("/api/themes")
    def api_themes():
        return list_themes()

    @app.get("/api/themes/{theme_name}")
    def api_theme_info(theme_name: str):
        try:
            return get_theme_info(theme_name)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @app.post("/api/convert")
    def api_convert(req: ConvertRequest):
        try:
            html = convert(req.markdown, theme=req.theme, watermark=req.watermark)
            return {"html": html, "theme": req.theme}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Serve showcase static files if available
    showcase_dir = Path(__file__).parent.parent / "showcase"
    if showcase_dir.exists():
        @app.get("/", response_class=HTMLResponse)
        def index():
            index_file = showcase_dir / "index.html"
            if index_file.exists():
                return index_file.read_text(encoding="utf-8")
            return "<h1>inkpress</h1><p>Showcase not found.</p>"

        app.mount("/js", StaticFiles(directory=str(showcase_dir / "js")), name="js")
        app.mount("/static", StaticFiles(directory=str(showcase_dir)), name="static")

    return app
