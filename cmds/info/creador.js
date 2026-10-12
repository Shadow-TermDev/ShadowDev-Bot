// .creador — contacto del creador.
export default {
  command: ['creador', 'owner', 'dueño'],
  category: 'info',
  desc: 'Muestra al creador del bot',
  run: async ({ msg, sock }) => {
    const nums = global.owner.map((n) => `ᰔᩚ @${n}`).join('\n');
    await sock.sendMessage(
      msg.chat,
      {
        text: `• :･ﾟ⊹˚• \`『 Creador 』\` •˚⊹:･ﾟ•\n\n${nums}\n\n> *${global.botname2} • ${global.dev}*`,
        mentions: global.owner.map((n) => n + '@s.whatsapp.net')
      },
      { quoted: { key: msg.key, message: {} } }
    );
  }
};
