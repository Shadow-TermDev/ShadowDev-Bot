// ShadowDev-Bot — núcleo estilo Hutao (logs, QR y código de 8 dígitos).
import './settings.js';
import handler from './handler.js';
import cmdsLoader from './lib/cmdsloader.js';
import { smsg } from './lib/serialize.js';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import fs from 'fs';
import readlineSync from 'readline-sync';
import pkg from './package.json' with { type: 'json' };

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(` INFO `), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(` SUCCESS `), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.blueBright.bold(` WARNING `), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(` ERROR `), chalk.redBright(msg))
};

// ── Método de vinculación: --qr o --code ──
const methodQR = process.argv.includes('--qr');
const methodCode = process.argv.includes('--code');
const SESSION_DIR = './Sessions/ShadowDev';
let phoneNumber = '';
let opcion = '';

function normalizePhone(input) {
  let s = String(input).replace(/\D/g, '');
  if (!s) return '';
  if (s.startsWith('0')) s = s.replace(/^0+/, '');
  return s;
}

console.log(chalk.magenta.bold('\n INICIANDO SISTEMA ...'));
console.log(
  chalk.cyan(`
      ${global.botname} v${pkg.version}
     Powered by ${global.dev} ~
`)
);
console.log(chalk.gray(`[ ✿ ] node ${process.version} | ${process.platform} | prefijos . / ! #`));

async function pedirVinculacion() {
  if (fs.existsSync(`${SESSION_DIR}/creds.json`)) return;
  const line = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》';
  if (!methodQR && !methodCode) {
    opcion = readlineSync.question(
      `╭${line}\n┊ ${chalk.magenta.bold('METODO DE VINCULACION')}\n┊ ${chalk.bold.redBright('=> Opcion 1:')} ${chalk.greenBright('Codigo QR.')}\n┊ ${chalk.bold.redBright('=> Opcion 2:')} ${chalk.greenBright('Codigo de 8 digitos.')}\n╰${line}\n${chalk.bold.magentaBright('---> ')}`
    );
    while (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright('Solo se permite 1 o 2.'));
      opcion = readlineSync.question('--> ');
    }
  }
  if (methodQR) opcion = '1';
  if (methodCode) opcion = '2';

  if (opcion === '2') {
    while (true) {
      console.log(chalk.bold.yellowBright('\nIngrese el número de WhatsApp con código país (ej: 51910763332)\n---> '));
      phoneNumber = normalizePhone(readlineSync.question(''));
      if (phoneNumber.length < 10) {
        console.log(chalk.bold.redBright(`"${phoneNumber || 'vacío'}" no parece un número válido, intenta de nuevo.`));
        continue;
      }
      const ok = readlineSync.question(`Vincular el número +${phoneNumber}? (s/n): `);
      if (/^s/i.test(ok.trim())) break;
      console.log(chalk.gray('OK, ingresa otro número.'));
    }
  }
}

let reconexion = 0;
const retriesLimit = 15;
let isRestarting = false;

export async function startBot() {
  if (isRestarting) return;
  isRestarting = true;
  console.log(chalk.gray('[ ✿ ] Cargando sesión...'));
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  console.log(chalk.gray('[ ✿ ] Sesión OK, obteniendo versión de WhatsApp...'));
  let version;
  for (let i = 1; i <= 3; i++) {
    try {
      ({ version } = await Promise.race([
        fetchLatestBaileysVersion(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 20s')), 20000))
      ]));
      break;
    } catch (e) {
      console.log(chalk.yellow(`[ ✿ ] Intento ${i}/3 fallido (${e?.message || e})...`));
      if (i === 3) {
        log.error('Sin conexión para iniciar. Revisa tus datos/wifi y reintenta.');
        isRestarting = false;
        process.exit(1);
      }
    }
  }
  console.log(chalk.gray(`[ ✿ ] Versión OK, conectando...`));
  console.info = () => {};
  console.debug = () => {};

  // Caché de medios en memoria: repetir la misma imagen (menú) no la resube
  const mediaMap = new Map();
  const mediaCache = {
    get: (k) => mediaMap.get(k),
    set: (k, v) => mediaMap.set(k, v),
    del: (k) => mediaMap.delete(k),
    flushAll: () => mediaMap.clear()
  };

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
    mediaCache,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    keepAliveIntervalMs: 25_000
  });

  global.sock = sock;
  global.bootTime = Date.now();
  // Bienvenidas y despedidas por grupo
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const { getChat } = await import('./lib/chats.js');
      const cfg = getChat(anu.id);
      if ((!cfg.welcome && !cfg.bye) || cfg.botOff) return;
      const meta = await sock.groupMetadata(anu.id).catch(() => null);
      const { displayName } = await import('./lib/users.js');
      const { realPhone } = await import('./lib/grupo.js');
      let invite = '';
      try {
        invite = 'https://chat.whatsapp.com/' + (await sock.groupInviteCode(anu.id));
      } catch {}
      const yo = (sock.user?.id || '').split(':')[0];
      for (const p of anu.participants || []) {
        const jid = typeof p === 'string' ? p : p.id || p.jid || '';
        if (!jid || jid.split('@')[0].split(':')[0] === yo) continue;
        const tag = '@' + jid.split('@')[0];
        const gname = meta?.subject || 'el grupo';
        const gdesc = meta?.desc || 'sin descripción';
        const members = meta?.participants?.length || '?';
        const hora = new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' });
        const nombre = displayName(jid, null);
        const numero = await realPhone(sock, anu.id, jid).catch(() => jid.split('@')[0]);
        const perfil = `✿ ${nombre} (+${numero})`;
        const fill = (t) => t
          .replace(/\{user\}/g, tag)
          .replace(/\{group\}/g, gname)
          .replace(/\{desc\}/g, gdesc)
          .replace(/\{members\}/g, String(members))
          .replace(/\{time\}/g, hora)
          .replace(/\{link\}/g, invite || '')
          .replace(/\{perfil\}/g, perfil)
          .replace(/\{prefix\}/g, '.');
        if (anu.action === 'add' && cfg.welcome) {
          const t = fill(cfg.welcomeMsg || '❀ ¡Bienvenido a |{group}|!\n\t» {user}\n\n{perfil}\n\n> ✐ Puedes usar *{prefix}menu* para ver la lista de comandos.\n> 🜸 {link}');
          await sock.sendMessage(anu.id, { text: t, mentions: [jid] });
        }
        if ((anu.action === 'remove' || anu.action === 'leave') && cfg.bye) {
          const t = fill(cfg.byeMsg || '✿ *Adiós* {user}\n\n> ✐ Gracias por estar aquí.');
          await sock.sendMessage(anu.id, { text: t, mentions: [jid] });
        }
      }
    } catch (e) {
      console.error('[events]', e?.message || e);
    }
  });
  // Registra lo que el bot envía (para detectar réplicas aunque cambie el JID/LID)
  global.botSent ||= new Map();
  const rawSend = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, opts) => {
    try {
      const t =
        content?.conversation ||
        content?.extendedTextMessage?.text ||
        content?.imageMessage?.caption ||
        content?.videoMessage?.caption;
      if (t) {
        const arr = global.botSent.get(jid) || [];
        arr.push(t.slice(0, 120));
        global.botSent.set(jid, arr.slice(-8));
      }
    } catch {}
    return rawSend(jid, content, opts);
  };
  sock.ev.on('creds.update', saveCreds);

  // Código de 8 dígitos (solo si la sesión aún no está registrada)
  if (opcion === '2' && !state.creds.registered) {
    let code = null;
    for (let i = 1; i <= 3 && !state.creds.registered; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        console.log(chalk.gray(`[ ✿ ] Solicitando código (${i}/3) para +${phoneNumber}...`));
        const pairing = await sock.requestPairingCode(phoneNumber);
        code = pairing?.match(/.{1,4}/g)?.join('-') || pairing;
        console.log(
          chalk.bold.white(chalk.bgMagenta('Código de emparejamiento:')),
          chalk.bold.white(code)
        );
        console.log(chalk.yellow('WhatsApp > ⋮ > Dispositivos vinculados > Vincular un dispositivo > Vincular con número de teléfono'));
        break;
      } catch (err) {
        console.log(chalk.red(`Intento ${i}/3: ${err?.message || err}`));
        if (i === 3) {
          log.error('No se pudo generar el código. Verifica el número y tu conexión, luego reintenta.');
          process.exit(1);
        }
      }
    }
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const raw of messages) {
      try {
        if (!raw?.message || raw.key?.remoteJid === 'status@broadcast') continue;
        const m = await smsg(sock, raw);
        await handler(sock, m);
      } catch (err) {
        console.error(chalk.gray(`[ main ] ${err?.message || err}`));
      }
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update;
    // QR protegido: solo se genera si hay string (fix del crash de Hutao)
    if (qr) {
      if (opcion === '1' || methodQR) {
        console.log(chalk.green.bold('[ ✿ ] Escanea este código QR'));
        try {
          qrcode.generate(qr, { small: true });
        } catch (e) {
          console.log(chalk.gray(`[ QR ] ${e?.message || e}`));
          console.log(qr);
        }
      }
    }
    if (connection === 'open') {
      reconexion = 0;
      isRestarting = false;
      log.success(`Conectado a: ${sock.user?.name || 'Desconocido'}`);
      log.info(`Grupo oficial: ${global.link}`);
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;
      if (
        [DisconnectReason.loggedOut, DisconnectReason.forbidden].includes(reason)
      ) {
        log.warn(`Sesión cerrada (${reason}), elimina ${SESSION_DIR} y vuelve a vincular.`);
        isRestarting = false;
        process.exit(1);
      }
      reconexion++;
      if (reconexion > retriesLimit) {
        log.error('Demasiados reintentos, revisa tu conexión.');
        isRestarting = false;
        process.exit(1);
      }
      const delay = Math.min(3000 * reconexion, 30000);
      log.warn(`Desconexión (${reason}), reconectando en ${delay / 1000}s...`);
      isRestarting = false;
      setTimeout(startBot, delay);
    }
  });
}

(async () => {
  await cmdsLoader();
  await pedirVinculacion();
  await startBot();
})();
