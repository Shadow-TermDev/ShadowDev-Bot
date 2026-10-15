> [!NOTE]
> **ShadowDev-Bot está en constante evolución.** Bot de WhatsApp para la comunidad **Shadow-TermDev**: descargas, gacha, economía, IA y gestión de grupos, gratis y open source. 🌐 https://Shadow-TermDev.github.io

<p align="center">
  <img src="https://Shadow-TermDev.github.io/assets/shadowdev-banner-mini.jpg" alt="ShadowDev" style="width: 75%; height: auto; max-width: 400px;">
</p>

<p align="center">
<a href="#"><img title="ShadowDev" src="https://img.shields.io/badge/Bot-gratuito-multifunción-y-código-abierto-purple?colorA=%239b33b0&colorB=%231c007b&style=for-the-badge"></a>
</p>

---

## 💥 Descripción

ShadowDev-Bot es un bot de WhatsApp multifuncional basado en `baileys` oficial.

---

## ☃️ Características

- Descargas (YouTube, TikTok, X, Spotify, GitHub)
- Gacha + economía con banco y robos
- IA con personaje + memoria de usuarios
- Gestión de grupos (warns, antilink, antispam, welcome)
- Stickers con pack y autor

---

## 🌾 Informaciones Importantes

<details>
<summary><strong>⛄ Información</strong> — Recomendado</summary>

Usa Baileys oficial y Node 22+.

</details>

<details>
<summary><strong>⛄ Información</strong> — Datos</summary>

Sesión (`Sessions/`), datos (`data/`) y caché (`cache/`) no se suben a GitHub.

</details>

---

### Instalaciones Básicas

<details>
<summary><strong>💣 Termux</strong> — Manualmente</summary>

```bash
termux-setup-storage
```

```bash
pkg update && pkg install -y git nodejs ffmpeg
```

```bash
git clone https://github.com/Shadow-TermDev/ShadowDev-Bot
```

```bash
cd ShadowDev-Bot
```

```bash
npm install
```

```bash
npm start
```

> *Elige **1** (QR) o **2** (código de 8 dígitos) y vincula desde WhatsApp.*

</details>

<details>
<summary><strong>💣 VPS</strong> — Siempre activo</summary>

```bash
git clone https://github.com/Shadow-TermDev/ShadowDev-Bot
```

```bash
cd ShadowDev-Bot
```

```bash
source ~/.nvm/nvm.sh && nvm use 22
```

```bash
npm install
```

```bash
chmod +x start-vps.sh && ./start-vps.sh --code
```

> *`start-vps.sh` revive el bot si se cae. Para detener: `pkill -f "node index.js"`.*

</details>

<details>
<summary><strong>💣 Comandos para tener más tiempo activo</strong> — Termux</summary>

```bash
termux-wake-lock && npm i -g pm2 && pm2 start index.js --name shadowdev && pm2 save && pm2 logs
```

> *Ver logs con Termux cerrado:*
```bash
pm2 logs
```

> *Detener:*
```bash
pm2 stop shadowdev
```

> *Reanudar:*
```bash
pm2 start shadowdev
```

> *Borrar historial PM2:*
```bash
pm2 delete shadowdev
```

</details>

---

## ⚙️ Configuración (`settings.js`)

1. `global.owner` → tus números con código país, sin `+`.
2. `global.api.key` / `key2` → keys de https://api.stellarwa.xyz.

## Ejemplos de Comandos

- `.menu` — menú completo
- `.play <nombre>` — audio de YouTube
- `.rw` → `.claim` — gacha
- `.daily` / `.dep all` / `.rob @alguien` — economía
- `.sticker` / `.kick` / `.tagall` — grupo y fun
- `.ia <pregunta>` — IA con personaje
