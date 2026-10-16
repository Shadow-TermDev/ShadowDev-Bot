// .testmode on/off — modo prueba manual: solo el owner usa el bot.
import { setConfig } from '../../lib/config.js';

export default {
  command: ['testmode', 'modoprueba'],
  category: 'owner',
  access: 'owner',
  desc: 'Solo el owner usa el bot',
  uso: '<on/off>',
  run: async ({ msg, args, isOwner }) => {
    if (!isOwner) return msg.reply(global.mess.owner);
    const v = (args[0] || '').toLowerCase();
    if (!v) {
      return msg.reply(`✿ *Modo prueba »* ${global.testMode ? 'activado' : 'desactivado'}.\n> ✦ Usa *.testmode on* u *.testmode off*.`);
    }
    if (!['on', 'off'].includes(v)) return msg.reply('❍ Ej: *.testmode on* u *.testmode off*.');
    if (global.testMode === (v === 'on')) return msg.reply('❍ El modo prueba ya está así.');
    global.testMode = v === 'on';
    setConfig('testMode', global.testMode);
    await msg.reply(
      global.testMode
        ? '• :･ﾟ⊹˚• `『 Test Mode 』` •˚⊹:･ﾟ•\n\nᰔᩚ *Estado »* activado\n> ✐ _Solo el Owner puede usar el bot, por prefijo o lenguaje natural._\n\n> *' + global.botname2 + ' • ' + global.dev + '*'
        : '✿ *Modo prueba »* desactivado. Todos vuelven a usar el bot.'
    );
  }
};
