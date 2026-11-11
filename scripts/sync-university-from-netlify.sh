#!/usr/bin/env bash
set -euo pipefail

SOURCE_URL="${SITE_SOURCE_URL:-https://karthikvaidhyanathan.com/}"
WEB_ROOT="${SITE_WEB_ROOT:-$HOME/public_html}"
WORK_ROOT="${SITE_SYNC_ROOT:-$HOME/.site-sync}"
RUN_DIRECTORY="$WORK_ROOT/run-$(date +%s)-$$"
SITEMAP_FILE="$RUN_DIRECTORY/sitemap.xml"
URL_LIST="$RUN_DIRECTORY/urls.txt"

cleanup() {
  rm -rf "$RUN_DIRECTORY"
}
trap cleanup EXIT

mkdir -p "$RUN_DIRECTORY" "$WEB_ROOT" "$WORK_ROOT"

/usr/bin/curl --fail --silent --show-error --location \
  "${SOURCE_URL}sitemap.xml" \
  --output "$SITEMAP_FILE"

/usr/bin/python3 - "$SITEMAP_FILE" "$URL_LIST" "$SOURCE_URL" <<'PYTHON'
from pathlib import Path
import sys
import xml.etree.ElementTree as ElementTree

sitemap_path, url_list_path, source_url = sys.argv[1:]
root = ElementTree.parse(sitemap_path).getroot()
urls = {source_url}

for element in root.iter():
    if element.tag.endswith("loc") and element.text:
        urls.add(element.text.strip())

Path(url_list_path).write_text("\n".join(sorted(urls)) + "\n", encoding="utf-8")
PYTHON

/usr/bin/wget \
  --quiet \
  --page-requisites \
  --convert-links \
  --adjust-extension \
  --domains karthikvaidhyanathan.com \
  --no-host-directories \
  --directory-prefix "$RUN_DIRECTORY" \
  --input-file "$URL_LIST"

/usr/bin/curl --fail --silent --show-error --location \
  "${SOURCE_URL}robots.txt" \
  --output "$RUN_DIRECTORY/robots.txt"

rm -f "$URL_LIST"

test -s "$RUN_DIRECTORY/index.html"
test -s "$RUN_DIRECTORY/assets/site.css"

if grep -R -E "(href|src|action|poster|srcset)=['\"]/[^/]" "$RUN_DIRECTORY" --include='*.html'; then
  printf '%s\n' 'University sync aborted: root-relative paths remain after link conversion.' >&2
  exit 1
fi

/usr/bin/rsync -a --checksum "$RUN_DIRECTORY/" "$WEB_ROOT/"
date -Iseconds > "$WORK_ROOT/last-success.txt"
