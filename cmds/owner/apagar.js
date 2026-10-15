// .apagar — mata el proceso (owner). Para VPS sin kill: detiene en seco.
// Difiere de .restart: este sale con código 0 (sin auto-reinicio).
export default {
  command: ['apagar', 'shutdown', 'off', 'matar'],
  category: 'owner',
  desc: 'Apaga el bot',
  run: async ({ msg, isOwner }) => {
    if (!isOwner) return msg.reply(global.mess.owner);
    try {
      await msg.reply('✿ Apagando...');
    } catch {}
    setTimeout(() => process.exit(0), 1500);
  }
};
