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
      const clean = (s) => String(s).toLowerCase().replace(/\D/g, '');
      let h = 0;
      for (const ch of clean(a) + '❤' + clean(b)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
      const pct = h % 101;
      const barra = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      const veredicto = pct > 80 ? 'Boda ya 💍' : pct > 60 ? 'Hay química 🔥' : pct > 40 ? 'Como amigos 💫' : pct > 20 ? 'Complicado... 🌧️' : 'Ni en otro universo 💔';
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Amor 』\` •˚⊹:･ﾟ•\n\n✿ *@${clean(a) || a}* ❤ *@${clean(b) || b}*\n✿ *${pct}%* ${barra}\n> ✐ ${veredicto}\n\n> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
