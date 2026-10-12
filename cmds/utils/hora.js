// .hora — hora actual en varias ciudades (local, sin API).
const ZONAS = [
  ['Lima 🇵🇪', 'America/Lima'],
  ['CDMX 🇲🇽', 'America/Mexico_City'],
  ['Buenos Aires 🇦🇷', 'America/Argentina/Buenos_Aires'],
  ['Madrid 🇪🇸', 'Europe/Madrid']
];

export default {
  command: ['hora', 'time', 'reloj'],
  category: 'utils',
  desc: 'Hora actual en varias ciudades',
  run: async ({ msg }) => {
    try {
      const lineas = ZONAS.map(([nombre, tz]) => {
        const h = new Date().toLocaleTimeString('es-PE', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        return `ᰔᩚ *${nombre} »* ${h}`;
      }).join('\n');
      await msg.reply(`• :･ﾟ⊹˚• \`『 Hora 』\` •˚⊹:･ﾟ•\n\n${lineas}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
