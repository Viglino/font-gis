#!/bin/bash

SRC_DIR="$1"
DST_DIR="$2"

if [[ -z "$SRC_DIR" || -z "$DST_DIR" ]]; then
  echo "Usage: $0 source_dir target_dir"
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source directory '$SRC_DIR' does not exist."
  exit 1
fi

mkdir -p "$DST_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/sanitize.py"
if [[ ! -f "$PYTHON_SCRIPT" ]]; then
  echo "Python script '$PYTHON_SCRIPT' not found."
  exit 1
fi

SRC_DIR_ABS=$(realpath "$SRC_DIR")
DST_DIR_ABS=$(realpath -m "$DST_DIR")

find "$SRC_DIR_ABS" -type f -name '*.svg' | while read -r srcfile; do
  relpath=$(realpath --relative-to="$SRC_DIR_ABS" "$srcfile")

  targetdir="$DST_DIR_ABS/$(dirname "$relpath")"
  mkdir -p "$targetdir"

  targetfile="$targetdir/$(basename "$srcfile")"

  echo "Sanitizing $srcfile → $targetfile"

  cat "$srcfile" | python3 "$PYTHON_SCRIPT" > "$targetfile"
done

