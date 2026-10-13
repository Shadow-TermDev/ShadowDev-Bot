#!/bin/bash
# Runner para VPS: mantiene el bot vivo (reinicia si se cae).
# Uso: chmod +x start-vps.sh && ./start-vps.sh [--qr|--code]
# Requiere Node 22+ (usa nvm si existe).

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
  nvm use 22 >/dev/null 2>&1 || true
fi

echo "Node: $(node -v)"
cd "$(dirname "$0")" || exit 1

while true; do
  node index.js "$@"
  CODE=$?
  echo "[vps] proceso terminó con código $CODE, reiniciando en 5s... (Ctrl+C para salir)"
  sleep 5
done
