#!/bin/sh
set -eu

HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}/remote_demo.html"

cd "$HERE"

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/novel-rigged3d-demo.log 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

sleep 1

if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  printf 'Open %s in your browser.\n' "$URL"
fi

printf 'Novel V5.4 ready-rigged proof: %s\n' "$URL"
printf 'Press Ctrl+C to stop the local server.\n'
wait "$SERVER_PID"
