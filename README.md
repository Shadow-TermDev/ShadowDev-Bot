# ShadowDev-Bot 🤖

Bot de WhatsApp para el grupo **Shadow-TermDev** 🌐 https://Shadow-TermDev.github.io

Construido reciclando lo mejor de dos proyectos:
- **Hutao** → consola estilo (logs con colores, QR y código de 8 dígitos), estructura de comandos.
- **Megumin-Bot-MD** → filosofía de APIs libres con respaldo (Catbox para subidas, Stellar como API principal).

## APIs usadas (todas verificadas funcionales)

| Comando | Servicio | Key |
|---|---|---|
| `.play` `.play2` `.tiktok` `.twitter` | `api.stellarwa.xyz` | Sí — pon la tuya en `settings.js` |
| `.translate` | Google Translate + MyMemory | No |
| `.tourl` | `catbox.moe` | No |
| `.menu` | Banner **local** `media/banner.png` | No |

## Instalación

```bash
pkg install nodejs git
git clone <TU-REPO> ShadowDev-Bot
cd ShadowDev-Bot
npm install
```

## Configuración (`settings.js`)

1. `global.owner` → tus números con código país, sin `+`.
2. `global.api.key` → tu key de https://api.stellarwa.xyz (gratis, dashboard).
3. `global.banner` → por defecto `./media/banner.png` (ya incluida).

## Uso

```bash
npm start          # elige 1 (QR) o 2 (código 8 dígitos)
npm run qr         # directo a QR
npm run code       # directo a código de 8 dígitos
```

La sesión se guarda en `Sessions/ShadowDev/` (no se sube a GitHub).

## Comandos

- `.menu` — menú con banner local y link del grupo
- `.play <nombre>` — audio de YouTube
- `.play2 <nombre>` — video de YouTube
- `.tiktok <url>` — video de TikTok
- `.twitter <url>` — video/foto de X
- `.translate <idioma> <texto>` — traductor
- `.tourl` — (con imagen/video adjunto) devuelve URL
- `.setbanner` — (owner) cambia el banner

Prefijos: `.` `/` `!` `#`
