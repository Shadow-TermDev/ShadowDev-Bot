/*
  ShadowDev-Bot — configuración principal
  Edita tus números de owner y tu API key, guarda y reinicia.
*/
import fs from 'fs';
import { watchFile, unwatchFile } from 'fs';
import { fileURLToPath } from 'url';

// ── Owners (cambia/agrega tu número con código país, sin +) ──
global.owner = ['51910763332', '51917282040', '51935991809'];

// ── Identidad del bot ──
global.botname = 'ShadowDev-Bot';
global.botname2 = 'ShadowDev';
global.dev = 'Shadow-TermDev';
global.link = 'https://Shadow-TermDev.github.io';

// ── Vista previa del menú: sale del og:image del sitio (sin descargar nada) ──
// Ver <meta property="og:image"> en Shadow-TermDev.github.io/index.html

// ── Stack de descargas (todo verificado funcionando, SIN keys) ──
// YouTube audio/video: SaveTube (savetube.me API)
// TikTok: tikwm.com API — X/Twitter: fxtwitter API
// IA: pollinations.ai — Traductor: Google + MyMemory — Subidas: catbox.moe
// (Stellar/EvoGB/delirius murieron: 502 / DNS / DEPLOYMENT_NOT_FOUND)

global.msgglobal = '❍ Ocurrió un problema, contacte al creador.';
global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  owner: '✿ Este comando solo puede ser usado por el Owner.'
};

global.my = {
  ch: '120363407128588763@newsletter'
};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log('settings.js actualizado, reinicia el bot.');
  import(`${file}?update=${Date.now()}`);
});
