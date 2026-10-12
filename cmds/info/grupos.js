// .grupos — lista los grupos donde está el bot (puro Baileys).
export default {
  command: ['grupos', 'groups'],
  category: 'info',
  desc: 'Lista los grupos del bot',
  run: async ({ msg, sock, isOwner }) => {
    try {
      if (!isOwner) return msg.reply(global.mess.owner);
      const all = await sock.groupFetchAllParticipating();
      const list = Object.values(all);
      if (!list.length) return msg.reply('❍ El bot no está en ningún grupo.');
      const txt = list.slice(0, 30).map((g, i) => `ᰔᩚ *${i + 1}.* ${g.subject} (${g.participants?.length || '?'} 👥)`).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Grupos (${list.length}) 』\` •˚⊹:･ﾟ•\n\n${txt}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[grupos]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
