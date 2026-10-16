// .apagar — mata el proceso (owner). Para VPS sin kill: detiene en seco.
// Difiere de .restart (exit 1): este sale con código 0 (sin auto-reinicio).
export default {
  command: ['apagar', 'shutdown', 'off', 'matar'],
  category: 'owner',
  access: 'owner',
  desc: 'Apaga el bot',
  run: async ({ msg, sock, isOwner }) => {
    if (!isOwner) return msg.reply(global.mess.owner);
    try {
      const hora = new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' });
      await msg.reply(
        `✿ *Apagado a las ${hora}.* Ya no respondo.\n` +
        `> ✐ Si sigo en línea en 1 minuto, tu panel me revivió: detenme ahí.`
      );
    } catch {}
    try {
      await sock.end();
    } catch {}
    setTimeout(() => process.exit(0), 2000);
  }
};
