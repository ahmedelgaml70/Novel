#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node validate_method.js
rm -rf frames
mkdir -p frames
node render_current.js
ffmpeg -y -loglevel error -framerate 24 -i frames/%05d.png -i soundscape.wav \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest \
  living_engraving_current.mp4
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 living_engraving_current.mp4
