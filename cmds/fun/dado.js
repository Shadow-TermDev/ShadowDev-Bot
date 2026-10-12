// .dado — lanza un dado (local, instantáneo).
export default {
  command: ['dado', 'dice', 'roll'],
  category: 'fun',
  desc: 'Lanza un dado de 6 caras',
  run: async ({ msg }) => {
    const n = 1 + Math.floor(Math.random() * 6);
    const caras = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    await msg.reply(`• :･ﾟ⊹˚• \`『 Dado 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *Salió »* ${caras[n - 1]} (${n})\n\n> *${global.botname2} • ${global.dev}*`);
  }
};
