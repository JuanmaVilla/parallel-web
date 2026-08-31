#!/usr/bin/env bash
#
# Convierte un video de Higgsfield en assets de secuencia de scroll.
#
#   ./scripts/convert-sequence.sh <video.mp4> <nombre-secuencia>
#
# Genera en public/sequences/<nombre-secuencia>/:
#   scrub.mp4      mp4 all-keyframe, resolucion completa
#   scrub-sm.mp4   idem a media resolucion, para movil
#   poster.avif    primer frame (reduced-motion y reserva de espacio)
#   poster.webp    respaldo del poster
#
# POR QUE ALL-KEYFRAME:
# Higgsfield exporta con un solo keyframe. Con eso, cada seek obliga al
# decoder a arrancar del frame 0, y el scrub se traba. Con -g 1 todos los
# frames son I-frames y el seek es instantaneo.
# Medido en este proyecto: 32.1 ms promedio antes, 3.6 ms despues.
#
# El costo en peso es menor de lo esperado porque el fondo negro de la marca
# comprime muy bien.
#
# POR QUE 20 FPS:
# Todo frame es un keyframe, asi que el peso sube casi lineal con la cantidad
# de frames. En un scrub el frame que se ve depende de cuanto scrolleaste, no
# de un reloj: nadie percibe la diferencia entre 20 y 30 fps arrastrando. El
# master de 30 fps daba 3.0 MB; a 20 fps y crf 28, 1.5 MB.
#
# POR QUE CRF 28 Y NO 23:
# El contenido es casi todo negro con un objeto iluminado. Comparado cuadro a
# cuadro contra crf 23, no aparece banding en el glow ni artefactos en los
# trazos. Bajar la calidad nominal ahorra ~40% sin diferencia visible.
#
set -euo pipefail

# Sobreescribibles: FPS=30 CRF=23 ./scripts/convert-sequence.sh ...
FPS="${FPS:-20}"
CRF="${CRF:-28}"

if [ $# -lt 2 ]; then
  echo "uso: $0 <video.mp4> <nombre-secuencia>" >&2
  exit 1
fi

SRC="$1"
NAME="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/sequences/$NAME"

command -v ffmpeg >/dev/null || { echo "falta ffmpeg: brew install ffmpeg" >&2; exit 1; }
[ -f "$SRC" ] || { echo "no existe: $SRC" >&2; exit 1; }

mkdir -p "$OUT"

probe() {
  ffprobe -v error -select_streams v:0 -show_entries "$1" \
    -of default=noprint_wrappers=1:nokey=1 "$SRC" | head -1
}

W=$(probe stream=width)
H=$(probe stream=height)
DUR=$(probe format=duration)

# nb_frames viene N/A en varios encoders. Si falta, se cuentan los packets.
FRAMES=$(probe stream=nb_frames)
case "$FRAMES" in
  ''|N/A|0)
    FRAMES=$(ffprobe -v error -select_streams v:0 -count_packets \
      -show_entries stream=nb_read_packets \
      -of default=noprint_wrappers=1:nokey=1 "$SRC" | head -1)
    ;;
esac

if [ -z "$W" ] || [ -z "$H" ] || [ -z "$FRAMES" ] || [ "$FRAMES" -lt 2 ]; then
  echo "no se pudo leer la metadata del video (w=$W h=$H frames=$FRAMES)" >&2
  exit 1
fi

echo "origen : ${W}x${H} · ${FRAMES} frames · ${DUR}s"

# --- Video all-keyframe -------------------------------------------------
# -g 1 -keyint_min 1 -sc_threshold 0  -> un keyframe por frame
# -an                                 -> sin audio, no se usa
# +faststart                          -> moov antes de mdat, empieza antes
echo "encodeando scrub.mp4 (all-keyframe, ${FPS}fps crf${CRF})..."
ffmpeg -y -v error -i "$SRC" -an -vf "fps=$FPS" -c:v libx264 -profile:v main -level 4.0 \
  -pix_fmt yuv420p -g 1 -keyint_min 1 -sc_threshold 0 -crf "$CRF" \
  -movflags +faststart "$OUT/scrub.mp4"

echo "encodeando scrub-sm.mp4 (movil)..."
ffmpeg -y -v error -i "$SRC" -an -vf "fps=$FPS,scale=trunc(iw/4)*2:trunc(ih/4)*2" \
  -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -sc_threshold 0 -crf "$CRF" \
  -movflags +faststart "$OUT/scrub-sm.mp4"

# --- Poster -------------------------------------------------------------
# Se ve con prefers-reduced-motion y mientras carga el video.
echo "extrayendo poster..."
ffmpeg -y -v error -i "$SRC" -frames:v 1 "$OUT/tmp-poster.png"

# ffmpeg de Homebrew no trae encoders webp/avif; sharp si, y ya viene con Next.
node -e "
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const D = process.argv[1], src = path.join(D, 'tmp-poster.png');
(async () => {
  await sharp(src).webp({ quality: 82, effort: 6 }).toFile(path.join(D, 'poster.webp'));
  await sharp(src).avif({ quality: 55, effort: 6 }).toFile(path.join(D, 'poster.avif'));
  fs.unlinkSync(src);
})();
" "$OUT"

KF=$(ffprobe -v error -select_streams v:0 -show_entries packet=flags -of csv=p=0 "$OUT/scrub.mp4" | grep -c "K_")
TOT=$(ffprobe -v error -select_streams v:0 -show_entries packet=flags -of csv=p=0 "$OUT/scrub.mp4" | wc -l | tr -d ' ')

echo ""
echo "listo -> public/sequences/$NAME"
echo "  keyframes: $KF/$TOT  (tienen que ser iguales)"
du -h "$OUT"/scrub.mp4 "$OUT"/scrub-sm.mp4 | sed 's/^/  /'
echo ""
# La duracion que va al manifiesto es la del ENCODE, no la del master: al
# remuestrear a $FPS el resultado queda unos milisegundos mas corto. Si se usa
# la del master, con progress=1 se pide un currentTime que no existe.
OUTDUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$OUT/scrub.mp4")

echo "Agregalo a lib/sequences.ts:"
echo ""
echo "  ${NAME//-/}: build(\"$NAME\", {"
echo "    width: $W, height: $H,"
echo "    duration: $OUTDUR,"
echo "    alt: \"...describir el contenido...\","
echo "  }),"
