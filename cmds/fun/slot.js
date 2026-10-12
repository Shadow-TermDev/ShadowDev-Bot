// .slot — tragamonedas (local, instantáneo).
const S = ['❀', '✿', '✦', '✰', '✧', '❍'];

export default {
  command: ['slot', 'tragamonedas', 'casino'],
  category: 'fun',
  desc: 'Juega al tragamonedas',
  run: async ({ msg }) => {
    const r = [0, 1, 2].map(() => S[Math.floor(Math.random() * S.length)]);
    const win = r[0] === r[1] && r[1] === r[2] ? '¡PREMIO MAYOR!' : r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? '¡Par! Casi...' : 'Suerte la próxima';
    await msg.reply(`• :･ﾟ⊹˚• \`『 Slot 』\` •˚⊹:･ﾟ•\n\n✿ ┃ ${r.join(' ┃ ')} ┃\n> ✐ ${win}\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}`);
  }
};
