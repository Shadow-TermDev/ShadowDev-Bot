// .olvidame — borra lo que el bot sabe de ti.
import { resetUser } from '../../lib/users.js';

export default {
  command: ['olvidame', 'borrami'],
  category: 'fun',
  desc: 'Borra tus datos del bot',
  run: async ({ msg }) => {
    try {
      resetUser(msg.sender);
      await msg.reply(`ᰔᩚ *Listo »* ya no me acuerdo de ti 🥲\n\n> *${global.botname2} • ${global.dev}*`);
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
