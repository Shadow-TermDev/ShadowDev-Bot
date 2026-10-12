// .cerrar — cierra el grupo (solo admins escriben). Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['cerrar', 'close'],
  category: 'grupo',
  desc: 'Cierra el grupo (solo admins escriben)',
  run: async ({ msg, sock }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      await sock.groupSettingUpdate(msg.chat, 'announcement');
      await msg.reply(`ᰔᩚ *Grupo cerrado.* Solo los admins pueden escribir.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[cerrar]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
