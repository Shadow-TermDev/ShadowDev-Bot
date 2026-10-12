// .restart — reinicia el bot (solo owner; útil con panel que auto-reinicia).
export default {
  command: ['restart', 'reiniciar'],
  category: 'owner',
  desc: 'Reinicia el bot',
  run: async ({ msg, isOwner }) => {
    if (!isOwner) return msg.reply(global.mess.owner);
    await msg.reply('> ✐ _Reiniciando..._');
    process.exit(1);
  }
};
