// .amor — compatibilidad entre dos personas (local, diversión).
export default {
  command: ['amor', 'ship', 'shippear'],
  category: 'fun',
  desc: 'Mide el amor entre dos',
  uso: '<@uno @otro>',
  run: async ({ msg, args }) => {
    try {
      const mentions = msg.mentionedJid || [];
      const a = mentions[0]?.split('@')[0] || args[0] || msg.pushName || 'Tú';
      const b = mentions[1]?.split('@')[0] || args[1] || 'nadie';
      const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
      const [na, nb] = [norm(a), norm(b)].sort();
      let h = 0;
      for (const ch of `${na}|${nb}`) h = (h * 31 + ch.codePointAt(0)) >>> 0;
      const pct = h % 101;
      const barra = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      const veredicto = pct > 80 ? 'Boda ya' : pct > 60 ? 'Hay química' : pct > 40 ? 'Como amigos' : pct > 20 ? 'Complicado...' : 'Ni en otro universo';
      const menciones = [...(msg.mentionedJid || [])];
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Amor 』\` •˚⊹:･ﾟ•\n\n✿ *@${a}* + *@${b}*\n✿ *${pct}%* ${barra}\n> ✐ ${veredicto}\n\n> *${global.botname2} • ${global.dev}*`,
        menciones.length >= 2 ? { mentions: menciones } : {}
      );
    } catch (e) {
      console.error('[amor]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
