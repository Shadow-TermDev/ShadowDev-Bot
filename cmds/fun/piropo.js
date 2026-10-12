// .piropo — piropos sanos (local, instantáneo).
const PIROPOS = [
  'Si la belleza fuera delito, tendrías cadena perpetua.',
  'Dicen que brillas más que la pantalla al 100%.',
  'Ni el WiFi se conecta tan rápido como yo contigo.',
  'Eres el bug más bonito de mi código.',
  'Si fueras comando, serías el favorito del menú.',
  'Con esa sonrisa ni el lunes pesa.',
  '¿Tienes mapa? Me pierdo en tu chat.',
  'Eres como el café: sin ti no arranco.',
  'Hasta mi bot dejó de procesar al verte.',
  'Si los cumplidos fueran mensajes, serías spam.'
];

export default {
  command: ['piropo', 'halago'],
  category: 'fun',
  desc: 'Recibe un piropo sano',
  run: async ({ msg }) => {
    const p = PIROPOS[Math.floor(Math.random() * PIROPOS.length)];
    await msg.reply(`• :･ﾟ⊹˚• \`『 Piropo 』\` •˚⊹:･ﾟ•\n\n> ✐ ${p}\n\n> *${global.botname2} • ${global.dev}*`);
  }
};
