// .rw — tira un personaje aleatorio (cooldown 3min, reclamo 5min).
import { getBuffer } from '../../lib/serialize.js';
import { getUser, saveUsers } from '../../lib/users.js';
import { duenoDe, getRoll, imagenDe, marcarTiro, msCorto, puedeTirar, setRoll, tirar } from '../../lib/gacha.js';

export default {
  command: ['rw', 'rollwaifu'],
  category: 'gacha',
  desc: 'Tira un personaje aleatorio',
  run: async ({ msg, sock }) => {
    try {
      const queda = puedeTirar(msg.sender);
      if (queda > 0) return msg.reply(`❍ Espera *${msCorto(queda)}* para volver a tirar.`);
      const p = tirar();
      if (!p) return msg.reply('❍ Sin personajes disponibles.');
      marcarTiro(msg.sender);
      try {
        const uu = getUser(msg.sender);
        uu.rolls = (uu.rolls || 0) + 1;
        saveUsers();
      } catch {}
      const previo = getRoll(msg.chat);
      setRoll(msg.chat, p, msg.sender);
      const img = await imagenDe(p.keyword);
      const dueno = duenoDe(p.name);
      const caption =
        `• :･ﾟ⊹˚• \`『 Gacha 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Nombre »* ${p.name}\n` +
        `✿ *Género »* ${p.gender || '?'}\n` +
        `✿ *Valor »* ${(p.value || 0).toLocaleString()} ${global.moneda}\n` +
        `✿ *Estado »* ${dueno ? `de @${dueno.jid.split('@')[0]}` : 'Libre'}\n` +
        `✿ *Fuente »* ${p.source || '?'}\n\n` +
        `> ✐ Reclama con *.claim* (5 min)${previo && !previo.claimedBy ? `\n> ✐ Se fue sin reclamar: *${previo.name}*` : ''}\n\n` +
        `> *${global.botname2} • ${global.dev}*`;
      try {
        if (!img) throw new Error('sin imagen');
        const buf = await getBuffer(img);
        await sock.sendMessage(msg.chat, { image: buf, caption, mentions: dueno ? [dueno.jid] : [] }, { quoted: { key: msg.key, message: {} } });
      } catch {
        await sock.sendMessage(msg.chat, { text: caption, mentions: dueno ? [dueno.jid] : [] }, { quoted: { key: msg.key, message: {} } });
      }
    } catch (e) {
      console.error('[rw]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
