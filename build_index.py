#!/usr/bin/env python3
"""Build dist/ with Vite for callers of the original build command."""
import subprocess
from pathlib import Path


if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    raise SystemExit(subprocess.run(["npm", "run", "build"], cwd=root, check=False).returncode)
