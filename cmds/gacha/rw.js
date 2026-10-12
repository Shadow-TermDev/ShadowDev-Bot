// .rw — tira un personaje aleatorio (cooldown 3min, reclamo 5min).
import { getBuffer } from '../../lib/serialize.js';
import { getRoll, imagenDe, marcarTiro, msCorto, puedeTirar, setRoll, tirar } from '../../lib/gacha.js';

export default {
  command: ['rw', 'roll', 'rollwaifu'],
  category: 'gacha',
  desc: 'Tira un personaje aleatorio',
  run: async ({ msg, sock }) => {
    try {
      const queda = puedeTirar(msg.sender);
      if (queda > 0) return msg.reply(`❍ Espera *${msCorto(queda)}* para volver a tirar.`);
      const p = tirar();
      if (!p) return msg.reply('❍ Sin personajes disponibles.');
      marcarTiro(msg.sender);
      const previo = getRoll(msg.chat);
      setRoll(msg.chat, p, msg.sender);
      const img = await imagenDe(p.keyword);
      const caption =
        `• :･ﾟ⊹˚• \`『 Gacha 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Personaje »* ${p.name}\n` +
        `✿ *Fuente »* ${p.source || '?'}\n` +
        `✿ *Valor »* ${(p.value || 0).toLocaleString()} ${global.moneda}\n\n` +
        `> ✐ Reclama con *.claim* (5 min)${previo && !previo.claimedBy ? `\n> ✐ Se fue sin reclamar: *${previo.name}*` : ''}\n\n` +
        `> *${global.botname2} • ${global.dev}*
> ${global.link}`;
      try {
        if (!img) throw new Error('sin imagen');
        const buf = await getBuffer(img);
        await sock.sendMessage(msg.chat, { image: buf, caption }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await sock.sendMessage(msg.chat, { text: caption }, { quoted: { key: msg.key, message: {} } });
      }
    } catch (e) {
      console.error('[rw]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
