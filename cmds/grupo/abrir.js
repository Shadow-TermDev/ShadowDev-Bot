// .abrir / .cerrar — abre o cierra el grupo (solo admins escriben). Solo admins.
import { checkGroup } from '../../lib/grupo.js';

export default {
  command: ['abrir', 'open'],
  category: 'grupo',
  access: 'admin',
  desc: 'Abre el grupo (todos escriben)',
  run: async ({ msg, sock }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      await sock.groupSettingUpdate(msg.chat, 'not_announcement');
      await msg.reply(`✿ *Grupo abierto.* Todos pueden escribir.\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[abrir]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
