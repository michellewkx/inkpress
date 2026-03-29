# -*- coding: utf-8 -*-
"""
Theme loader for inkpress.
Loads YAML theme configs with support for:
- Built-in themes (themes/ directory)
- User custom themes (~/.inkpress/themes/)
- Series/tags metadata
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Optional, List


class ThemeLoader:
    """Load and manage inkpress themes from YAML files."""

    def __init__(self, themes_dir: Optional[str] = None):
        if themes_dir is None:
            # Look for themes inside the package first (pip install)
            pkg_themes = Path(__file__).parent.parent / "themes"
            # Fallback: themes/ at repo root (dev mode)
            repo_themes = Path(__file__).parent.parent.parent / "themes"
            if pkg_themes.is_dir():
                themes_dir = pkg_themes
            elif repo_themes.is_dir():
                themes_dir = repo_themes
            else:
                themes_dir = pkg_themes  # will fail gracefully later
        self.themes_dir = Path(themes_dir).resolve()
        self.user_themes_dir = Path.home() / ".inkpress" / "themes"
        self._themes_cache: Dict[str, dict] = {}

    def _search_dirs(self) -> List[Path]:
        """Return theme directories in priority order (user > built-in)."""
        dirs = [self.themes_dir]
        if self.user_themes_dir.exists():
            dirs.insert(0, self.user_themes_dir)
        return dirs

    def load_theme(self, theme_name: str) -> dict:
        if theme_name in self._themes_cache:
            return self._themes_cache[theme_name]

        theme_file = self._find_theme_file(theme_name)
        if theme_file is None:
            available = ", ".join(self.list_themes().keys())
            raise ValueError(f"Theme '{theme_name}' not found. Available: {available}")

        with open(theme_file, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)

        self._themes_cache[theme_name] = config
        return config

    def load_raw_theme(self, theme_name: str) -> dict:
        """Load raw theme config (alias for load_theme)."""
        return self.load_theme(theme_name)

    def _find_theme_file(self, theme_name: str) -> Optional[Path]:
        for d in self._search_dirs():
            for ext in (".yaml", ".yml"):
                f = d / f"{theme_name}{ext}"
                if f.exists():
                    return f
        return None

    def list_themes(self) -> Dict[str, str]:
        """List all available themes. Returns {name: description}."""
        themes = {}
        for d in reversed(self._search_dirs()):
            if not d.exists():
                continue
            for file in sorted(d.iterdir()):
                if file.is_file() and file.suffix in (".yaml", ".yml"):
                    if file.stem.startswith("_"):
                        continue
                    try:
                        with open(file, "r", encoding="utf-8") as f:
                            config = yaml.safe_load(f)
                            themes[file.stem] = config.get("description", "")
                    except Exception:
                        themes[file.stem] = ""
        return themes

    def list_themes_by_series(self) -> Dict[str, List[Dict]]:
        """List themes grouped by series."""
        series_map: Dict[str, List[Dict]] = {}
        for name in self.list_themes():
            try:
                config = self.load_theme(name)
                series = config.get("series", "other")
                entry = {
                    "name": name,
                    "display_name": config.get("name", name),
                    "description": config.get("description", ""),
                    "tags": config.get("tags", []),
                }
                series_map.setdefault(series, []).append(entry)
            except Exception:
                pass
        return series_map

    def get_theme_info(self, theme_name: str) -> Dict[str, str]:
        config = self.load_theme(theme_name)
        return {
            "name": config.get("name", theme_name),
            "description": config.get("description", ""),
            "series": config.get("series", "other"),
            "tags": config.get("tags", []),
        }

    def reload_theme(self, theme_name: str) -> dict:
        if theme_name in self._themes_cache:
            del self._themes_cache[theme_name]
        return self.load_theme(theme_name)


# Global singleton
_global_theme_loader = None


def get_theme_loader() -> ThemeLoader:
    global _global_theme_loader
    if _global_theme_loader is None:
        _global_theme_loader = ThemeLoader()
    return _global_theme_loader
