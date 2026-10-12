// .moneda — cara o cruz (local, instantáneo).
export default {
  command: ['moneda', 'coin', 'volado'],
  category: 'fun',
  desc: 'Lanza una moneda',
  run: async ({ msg }) => {
    const r = Math.random() < 0.5 ? 'Cara' : 'Cruz';
    await msg.reply(`• :･ﾟ⊹˚• \`『 Moneda 』\` •˚⊹:･ﾟ•\n\n✿ *Salió »* ${r}\n\n> *${global.botname2} • ${global.dev}*`);
  }
};
