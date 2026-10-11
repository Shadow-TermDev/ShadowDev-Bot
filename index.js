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
      ${global.botname}
     Powered by ${global.dev} ~
`)
);

const hasSession = fs.existsSync(`${SESSION_DIR}/creds.json`);

if (!hasSession && !methodQR && !methodCode) {
  const line = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》';
  opcion = readlineSync.question(
    `╭${line}\n┊ ${chalk.magenta.bold('METODO DE VINCULACION')}\n┊ ${chalk.bold.redBright('=> Opcion 1:')} ${chalk.greenBright('Codigo QR.')}\n┊ ${chalk.bold.redBright('=> Opcion 2:')} ${chalk.greenBright('Codigo de 8 digitos.')}\n╰${line}\n${chalk.bold.magentaBright('---> ')}`
  );
  while (!/^[1-2]$/.test(opcion)) {
    console.log(chalk.bold.redBright('Solo se permite 1 o 2.'));
    opcion = readlineSync.question('--> ');
  }
  if (opcion === '2') {
    console.log(chalk.bold.yellowBright('\nIngrese el número de WhatsApp (ej: +51910763332)\n---> '));
    phoneNumber = normalizePhone(readlineSync.question(''));
  }
} else if (methodCode && !phoneNumber) {
  console.log(chalk.bold.yellowBright('\nIngrese el número de WhatsApp (ej: +51910763332)\n---> '));
  phoneNumber = normalizePhone(readlineSync.question(''));
}

if (methodQR) opcion = '1';
if (methodCode) opcion = '2';

let reconexion = 0;
const retriesLimit = 15;
let isRestarting = false;

export async function startBot() {
  if (isRestarting) return;
  isRestarting = true;
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  console.info = () => {};
  console.debug = () => {};

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
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
  sock.ev.on('creds.update', saveCreds);

  // Código de 8 dígitos (solo si la sesión aún no está registrada)
  if (opcion === '2' && !state.creds.registered) {
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const pairing = await sock.requestPairingCode(phoneNumber);
          const code = pairing?.match(/.{1,4}/g)?.join('-') || pairing;
          console.log(
            chalk.bold.white(chalk.bgMagenta('Código de emparejamiento:')),
            chalk.bold.white(code)
          );
        }
      } catch (err) {
        console.log(chalk.red('Error al generar código:'), err?.message || err);
      }
    }, 3000);
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
  await startBot();
})();
