// .ping — estado del bot (sin APIs externas).
const boot = Date.now();

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return [d && `${d}d`, `${h % 24}h`, `${m % 60}m`, `${s % 60}s`].filter(Boolean).join(' ');
}

export default {
  command: ['ping', 'speed', 'estado'],
  category: 'info',
  desc: 'Muestra el estado y tiempo activo',
  run: async ({ msg }) => {
    const t0 = Date.now();
    const m = await msg.reply('🏓 Pong...');
    const lat = Date.now() - t0;
    await msg.reply(`🏓 *Pong!*\n> ✿ Latencia: ${lat}ms\n> ✿ Activo: ${fmt(Date.now() - boot)}\n> ✿ Comandos: ${new Set([...global.cmds.values()].map((c) => c.run)).size}`);
  }
};
