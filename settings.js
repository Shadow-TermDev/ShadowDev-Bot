/*
  ShadowDev-Bot — configuración principal
  Edita tus números de owner y tu API key, guarda y reinicia.
*/
import fs from 'fs';
import { watchFile, unwatchFile } from 'fs';
import { fileURLToPath } from 'url';
import { getConfig } from './lib/config.js';

// ── Owners (cambia/agrega tu número con código país, sin +) ──
global.owner = ['51910763332', '51917282040', '51935991809'];

// ── Identidad del bot ──
global.botname = 'ShadowDev-Bot';
global.botname2 = 'ShadowDev';
global.dev = 'Shadow-TermDev';
global.link = 'https://Shadow-TermDev.github.io';

// ── Vista previa del menú: sale del og:image del sitio (sin descargar nada) ──
// Ver <meta property="og:image"> en Shadow-TermDev.github.io/index.html

// ── API Stellar (key de prueba conseguida, VERIFICADA viva 12/10) ──
// Se usa para búsqueda de TikTok; el resto sigue con métodos libres.
global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'api_de_prueba'
};

global.msgglobal = '❍ Ocurrió un problema, contacte al creador.';

// ── Moneda de la economía (cambiable con .setmoneda) ──
global.moneda = getConfig().moneda || 'moras';
global.mess = {
  socket: '❍ Este comando solo puede usarlo un *Socket*.\n> ✦ Pide ayuda a un administrador.',
  admin: '❍ Este comando solo lo usan los *Admins del grupo*.',
  botAdmin: '❍ El bot necesita ser *Admin del grupo* para esto.',
  owner: '❍ Este comando solo lo usa el *Owner*.'
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
