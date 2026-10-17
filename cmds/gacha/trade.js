// .trade — propone intercambio; el otro acepta con .trade si o rechaza con .trade no.
import { displayName, getUser, saveUsers } from '../../lib/users.js';
import { buscarPersonaje, clearTrade, getTrade, setTrade } from '../../lib/gacha.js';

export default {
  command: ['trade', 'intercambiar', 'cambiar'],
  category: 'gacha',
  desc: 'Intercambia personajes',
  uso: '<@usuario> <tu PJ> / <su PJ> | si | no',
  run: async ({ msg, sock, args }) => {
    try {
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'si' || sub === 'sí' || sub === 'aceptar') {
        const t = getTrade(msg.chat);
        if (!t || t.to !== msg.sender) return msg.reply('❍ No tienes ofertas pendientes.');
        const a = getUser(t.from);
        const b = getUser(msg.sender);
        const ia = (a.characters || []).findIndex((c) => c.name === t.give);
        const ib = (b.characters || []).findIndex((c) => c.name === t.take);
        if (ia < 0 || ib < 0) {
          clearTrade(msg.chat);
          return msg.reply('❍ Alguien ya no tiene su personaje. Trato cancelado.');
        }
        const [ca] = a.characters.splice(ia, 1);
        const [cb] = b.characters.splice(ib, 1);
        a.characters.push(cb);
        b.characters.push(ca);
        saveUsers();
        clearTrade(msg.chat);
        await sock.sendMessage(
          msg.chat,
          { text: `• :･ﾟ⊹˚• \`『 Intercambio 』\` •˚⊹:･ﾟ•\n\n✿ *@${t.from.split('@')[0]}* ↔ *@${t.to.split('@')[0]}*\n✿ *${ca.name}* ⇄ *${cb.name}*\n\n> *${global.botname2} • ${global.dev}*`, mentions: [t.from, t.to] },
          { quoted: { key: msg.key, message: {} } }
        );
        return;
      }
      if (sub === 'no' || sub === 'rechazar') {
        const t = getTrade(msg.chat);
        if (!t || (t.to !== msg.sender && t.from !== msg.sender)) return msg.reply('❍ No hay oferta que rechazar.');
        clearTrade(msg.chat);
        return msg.reply('❍ Oferta rechazada.');
      }
      const target = (msg.mentionedJid || [])[0] || null;
      const resto = args.filter((a) => !a.startsWith('@')).join(' ').split('/').map((s) => s.trim());
      const [miPJ = '', suPJ = ''] = resto;
      if (!target || target === msg.sender || !miPJ || !suPJ) {
        return msg.reply('❍ Ej: *.trade* @amigo Naruto / Sasuke');
      }
      const yo = getUser(msg.sender);
      const el = getUser(target);
      const iMio = buscarPersonaje(yo.characters, miPJ);
      const iSuyo = buscarPersonaje(el.characters, suPJ);
      if (iMio < 0) return msg.reply('❍ Ni siquiera tienes ese personaje. Mira tu *.inv*.');
      if (iSuyo < 0) return msg.reply('❍ Esa persona no tiene ese personaje.');
      const miReal = yo.characters[iMio].name;
      const suReal = el.characters[iSuyo].name;
      setTrade(msg.chat, { from: msg.sender, to: target, give: miReal, take: suReal });
      await sock.sendMessage(
        msg.chat,
        { text: `• :･ﾟ⊹˚• \`『 Oferta 』\` •˚⊹:･ﾟ•\n\n✿ *@${msg.sender.split('@')[0]}* ofrece *${miReal}* por *${suReal}* de *@${target.split('@')[0]}*\n\n> ✐ Responde *.trade si* o *.trade no* (10 min)\n\n> *${global.botname2} • ${global.dev}*`, mentions: [msg.sender, target] },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[trade]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
