// .setmoneda — cambia el nombre de la moneda (solo owner).
import { displayName } from '../../lib/users.js';
import { setConfig } from '../../lib/config.js';

export default {
  command: ['setmoneda', 'setcoin'],
  category: 'owner',
  access: 'owner',
  desc: 'Cambia el nombre de la moneda',
  uso: '<nombre>',
  run: async ({ msg, args, isOwner }) => {
    try {
      if (!isOwner) return msg.reply(global.mess.owner);
      const nombre = args.join(' ').trim().replace(/[^a-zA-Záéíóúñü ]/g, '').slice(0, 20);
      if (!nombre) return msg.reply('❍ Escribe un nombre. Ej: *.setmoneda* soles');
      setConfig('moneda', nombre);
      global.moneda = nombre;
      await msg.reply(`✿ *Moneda »* ahora es *${nombre}*.\n> ✐ Lo anuncia ${displayName(msg.sender, msg.pushName)}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[setmoneda]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
