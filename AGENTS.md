# AGENTS.md — Reglas del proyecto ShadowDev-Bot

Instrucciones para cualquier agente (humano o IA) que cree o modifique comandos.
El bot es ESM (`"type": "module"`), Node ≥22, Baileys oficial, sin base de datos.

## 1. Anatomía de un comando

Archivo en `cmds/<categoria>/<nombre>.js`:

```js
export default {
  command: ['cmd', 'alias2'],   // minúsculas, sin prefijo
  category: 'fun',              // info | downloader | ai | search | utils | fun | grupo | owner | gacha | economy
  desc: 'Qué hace, en 3-6 palabras',   // OBLIGATORIO, estilo abajo
  uso: '<param>',               // SOLO si necesita parámetro, formato <...>
  run: async ({ msg, sock, args }) => {
    try {
      // ...
    } catch (e) {
      console.error('[cmd]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
```

## 2. Regla alias + parámetro + desc (el menú los une solo)

- El menú renderiza: `ᰔᩚ *{alias} + {uso}*` y debajo `> ✦ {desc}`.
- Ejemplo resultante:
  ```
  ᰔᩚ *.play › .mp3 + <nombre o url>*
  > ✺ Baja audio en MP3 con portada
  ```
- `uso` siempre entre `< >`: `<url>`, `<texto>`, `<@mención | número>`, `<idioma> <texto>`.
- `desc` imperativa y corta: ❌ "Descarga o busca videos" → ✅ "Baja videos o busca en TikTok".
- Alias: pocos y útiles (2-4). Nada genérico (prohibido `buscar`, `url`, `x` solo si hay prefijo... `x` vale porque exige prefijo).

## 3. Estilo visual Rem (mensajes del bot)

- Títulos: `• :･ﾟ⊹˚• \`『 Nombre 』\` •˚⊹:･ﾟ•`
- Filas: `ᰔᩚ *Etiqueta »* valor`
- Notas/progreso: `> ✦ _texto..._`
- Errores de uso: `❍ mensaje. Ej: *.cmd* ejemplo`
- Pie en tarjetas: `> *${global.botname2} • ${global.dev}*`
- Respuestas de contenido (IA, traducción, letra): texto limpio, sin adornos.
- `run` recibe `{ msg, sock, args, text, command, prefix, usedPrefix, isOwner }`.
- Responder citando: `{ quoted: { key: msg.key, message: {} } }`.
- OJO: en `handler.js` el mensaje se llama `m` (no `msg`); en comandos es `msg`.
  Confundirlos revienta al catch con "Ocurrió un problema".
- `msg.reply(texto)` para texto simple.
- Comandos de grupo: usar `lib/grupo.js` (`checkGroup`, `resolveTarget`).
- IA: usar `lib/ia.js` (`preguntarIA`), nunca fetch directo a Pollinations.
- Usuarios/monedas: `lib/users.js` (`getUser`, `addCoins`, `setApodo`, `saveUsers`).
  El handler ya suma +10 🪙 por comando y registra `msgs`. Datos en `data/` (ignorado).
- Gacha: `lib/gacha.js` + catálogo `lib/characters.json` (1350). Cooldowns y
  reclamos ahí; imágenes vía `imagenDe()` (safebooru→gelbooru seguro).
- Chats: `lib/chats.js` (welcome/bye, antilink/antispam, warns, toggles
  botOff/economyOff/gachaOff/onlyAdmin). El handler aplica los gates solo.
- Emojis: SOLO set del menú (✿ ❍ ✐ ᰔᩚ 🜸 ❀ ✦ ✰ ✧ + Reactions 🕒✔️✖️).
  Nada de 🪙🎉👋 (moneda = texto via `global.moneda`).

## 4. APIs permitidas (verificadas, sin keys)

SaveTube (`lib/ytdl.js`) · tikwm · fxtwitter · Pollinations (`lib/ia.js`) ·
Google Translate + MyMemory · Catbox · lrclib · TinyURL · JokeAPI ·
Wikipedia · yt-search · GitHub codeload.

**Muertas (NO usar):** Stellar (`api.stellarwa.xyz`, 502), EvoGB, delirius
(`api.delirius.store` y `delirius-apiofc`), puruboy, nexevo, siputzx,
y2meta/cnv.cx, `uguu.se` (solo respaldo), `cdn.dix.lat` (500),
`tweeload`, Anabot async (sin status).

Regla: toda API nueva se prueba con `curl` antes de integrarla.

## 5. Prohibiciones técnicas (verificadas con sangre)

- **NO `externalAdReply`**: WhatsApp lo descarta en silencio (ACK sin entrega, 2 pruebas).
- **NO `prepareWAMessageMedia`**: el pipeline de Baileys 7 no genera thumbs
  (omite `thumbnail-link`, su jimp es incompatible). Miniaturas: `jimp` directo.
- **NO descargar el banner en el bot**: el menú es texto + link, la vista previa
  sale del `og:image` del sitio.
- **NO responder a mensajes propios**: `if (m.fromMe) return` ya está en el handler.
- **NO guardar sesión ni caché en git**: `Sessions/`, `cache/` están ignorados.
- **NUNCA `rm -rf data` ni `cache` en la carpeta viva**: ahí están los usuarios,
  monedas, gacha y toggles reales. Verificar solo con `node --check` y loader.

## 6. Verificación antes de commit

```bash
node --check <archivo>
node --input-type=module -e "await import('./settings.js'); const {default: l} = await import('./lib/cmdsloader.js'); await l();"
```

Mensajes de commit en español, estilo `v1.x: qué cambió`.
