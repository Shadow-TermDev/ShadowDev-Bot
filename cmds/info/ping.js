// .ping — estado del bot (sin APIs externas). Edita el mensaje (no duplica).
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
  desc: 'Ver el estado y tiempo activo del bot',
  run: async ({ msg, sock }) => {
    const t0 = Date.now();
    const { key } = await sock.sendMessage(
      msg.chat,
      { text: '> ✦ _Midiendo velocidad..._' },
      { quoted: { key: msg.key, message: {} } }
    );
    const lat = Date.now() - t0;
    const n = new Set([...global.cmds.values()].map((c) => c.run)).size;
    const out =
      `• :･ﾟ⊹˚• \`『 Estado 』\` •˚⊹:･ﾟ•\n\n` +
      `ᰔᩚ *Latencia »* ${lat}ms\n` +
      `ᰔᩚ *Activo »* ${fmt(Date.now() - boot)}\n` +
      `ᰔᩚ *Comandos »* ${n}`;
    try {
      await sock.sendMessage(msg.chat, { text: out, edit: key });
    } catch {
      await sock.sendMessage(msg.chat, { text: out }, { quoted: { key: msg.key, message: {} } });
    }
  }
};
