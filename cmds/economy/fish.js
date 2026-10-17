// .fish — pesca recompensas (cooldown 8min, estilo Alya).
import { getUser, saveUsers } from '../../lib/users.js';

const PECES = ['mojarra', 'pez globo', 'atún', 'bota vieja', 'dorado', 'tiburón bebé'];

export default {
  command: ['fish', 'pescar', 'pesca'],
  category: 'economy',
  desc: 'Pesca por monedas',
  run: async ({ msg }) => {
    try {
      const u = getUser(msg.sender);
      const queda = (u.fishCooldown || 0) - Date.now();
      if (queda > 0) {
        const m = Math.ceil(queda / 60000);
        return msg.reply(`❍ Recoge la caña *${m}m* y vuelve.`);
      }
      u.fishCooldown = Date.now() + 8 * 60 * 1000;
      const pez = PECES[Math.floor(Math.random() * PECES.length)];
      const n = pez === 'bota vieja' ? 0 : Math.floor(Math.random() * 3000) + 5000;
      u.coins = (u.coins || 0) + n;
      saveUsers();
      await msg.reply(
        n > 0
          ? `• :･ﾟ⊹˚• \`『 Pesca 』\` •˚⊹:･ﾟ•\n\n✿ *Atrapaste »* ${pez}\n✿ *Vale »* +${n.toLocaleString()} ${global.moneda}\n\n> *${global.botname2} • ${global.dev}*`
          : `• :･ﾟ⊹˚• \`『 Pesca 』\` •˚⊹:･ﾟ•\n\n✿ *Atrapaste »* ${pez}... no vale nada\n\n> *${global.botname2} • ${global.dev}*`
      );
    } catch (e) {
      console.error('[fish]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
