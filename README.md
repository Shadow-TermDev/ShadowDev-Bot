# ShadowDev-Bot 🤖

Bot de WhatsApp para el grupo **Shadow-TermDev** 🌐 https://Shadow-TermDev.github.io

Construido reciclando lo mejor de dos proyectos:
- **Hutao** → consola estilo (logs con colores, QR y código de 8 dígitos), estructura de comandos.
- **Megumin-Bot-MD** → filosofía de APIs libres con respaldo (Catbox para subidas, Stellar como API principal).

## APIs usadas (todas verificadas funcionando, sin keys)

| Comando | Servicio |
|---|---|
| `.play` `.play2` `.sp` | SaveTube (YouTube) |
| `.tiktok` | tikwm |
| `.twitter` | fxtwitter |
| `.ia` | Pollinations |
| `.translate` | Google Translate + MyMemory |
| `.tourl` | `catbox.moe` |
| `.wiki` | Wikipedia ES |
| `.menu` | Solo texto + link (la vista previa con el banner la pone WhatsApp desde el `og:image` del sitio) |

## Instalación

```bash
pkg install nodejs git
git clone https://github.com/Shadow-TermDev/ShadowDev-Bot.git
cd ShadowDev-Bot
npm install
```

## Configuración (`settings.js`)

1. `global.owner` → tus números con código país, sin `+`.
2. El banner del menú sale del `og:image` de tu web (ver `index.html` del sitio).

## Uso

```bash
npm start          # elige 1 (QR) o 2 (código 8 dígitos)
npm run qr         # directo a QR
npm run code       # directo a código de 8 dígitos
```

La sesión se guarda en `Sessions/ShadowDev/` (no se sube a GitHub).

## VPS (segunda máquina = nuevo vinculado)

Cada máquina es un dispositivo distinto: en la VPS hay que vincular de nuevo.

```bash
git clone https://github.com/Shadow-TermDev/ShadowDev-Bot.git
cd ShadowDev-Bot
source ~/.nvm/nvm.sh && nvm use 22   # Node 22 obligatorio
npm install
chmod +x start-vps.sh
./start-vps.sh --code   # o --qr; Ctrl+C NO basta: mata con pkill -f "node index.js"
```

`start-vps.sh` usa Node 22 vía nvm si existe y **reinicia solo** si el proceso
muere. Una sola instancia por máquina: dos bots con la misma sesión se
desconectan entre sí. Para detener: `pkill -f "node index.js"`.

## Comandos

- `.menu` — menú con banner local y link del grupo
- `.play <nombre>` — audio de YouTube
- `.play2 <nombre>` — video de YouTube
- `.tiktok <url>` — video de TikTok
- `.twitter <url>` — video/foto de X
- `.translate <idioma> <texto>` — traductor
- `.tourl` — (con imagen/video adjunto) devuelve URL

Prefijos: `.` `/` `!` `#`
