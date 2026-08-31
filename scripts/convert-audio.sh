#!/usr/bin/env bash
#
# Convierte un master en el par de assets que consume el reproductor A/B.
#
#   ./scripts/convert-audio.sh <master.wav> <slug>
#
# Genera:
#   public/audio/<slug>.mp3   mp3 192k, lo que se sirve
#   peaks impresos en consola para pegar en lib/audio.ts
#
# POR QUE MP3 Y NO AAC/OPUS:
# Opus pesa menos pero Safari lo soporta solo dentro de CAF/WebM y arrastra
# casos borde en iOS. mp3 lo decodifica todo lo que existe y a 192k la
# diferencia contra el wav no se escucha en parlantes de laptop ni en
# auriculares de calle, que es donde se va a escuchar esta seccion.
#
# POR QUE NO SE NORMALIZA:
# Son masters. El nivel ES el trabajo que la seccion muestra. Pasarles un
# loudnorm seria borrar justamente lo que se compara.
#
# POR QUE LOS PEAKS SE PRECALCULAN:
# El medidor de la seccion dibuja la envolvente real del tema. Calcularla en
# el browser obliga a bajar el archivo entero antes de pintar nada; sale del
# master una sola vez, aca, y viaja como 64 numeros en el bundle.
#
set -euo pipefail

BITRATE="${BITRATE:-192k}"
BUCKETS="${BUCKETS:-64}"

if [ $# -lt 2 ]; then
  echo "uso: $0 <master.wav> <slug>" >&2
  exit 1
fi

SRC="$1"
SLUG="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/audio"

command -v ffmpeg >/dev/null || { echo "falta ffmpeg: brew install ffmpeg" >&2; exit 1; }
[ -f "$SRC" ] || { echo "no existe: $SRC" >&2; exit 1; }

mkdir -p "$OUT"

DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$SRC")

echo "encodeando $SLUG.mp3 ($BITRATE)..."
ffmpeg -y -v error -i "$SRC" -vn -c:a libmp3lame -b:a "$BITRATE" \
  -write_xing 1 -id3v2_version 3 "$OUT/$SLUG.mp3"

# Envolvente: PCM mono 8 kHz -> RMS por bucket -> normalizado al pico.
# 8 kHz alcanza y sobra: se mide energia, no se reproduce.
echo "calculando envolvente ($BUCKETS barras)..."
PEAKS=$(ffmpeg -v error -i "$SRC" -ac 1 -ar 8000 -f s16le - | node -e "
const buckets = Number(process.argv[1]);
const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  const buf = Buffer.concat(chunks);
  const total = Math.floor(buf.length / 2);
  const size = Math.floor(total / buckets);
  const out = [];
  for (let b = 0; b < buckets; b++) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      const s = buf.readInt16LE((b * size + i) * 2) / 32768;
      sum += s * s;
    }
    out.push(Math.sqrt(sum / size));
  }
  const max = Math.max(...out) || 1;
  console.log(out.map((v) => Number((v / max).toFixed(2))).join(', '));
});
" "$BUCKETS")

echo ""
echo "listo -> public/audio/$SLUG.mp3"
du -h "$OUT/$SLUG.mp3" | sed 's/^/  /'
echo ""
echo "Agregalo a lib/audio.ts:"
echo ""
echo "  {"
echo "    slug: \"$SLUG\","
echo "    src: \"/audio/$SLUG.mp3\","
echo "    duration: $DUR,"
echo "    peaks: [$PEAKS],"
echo "  },"
