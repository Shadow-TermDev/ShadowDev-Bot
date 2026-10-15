// .kick — expulsa (responder, mencionar o número). Solo admins.
import { baseJid, checkGroup, esBot, findParticipant, objetivoHumano, pidOf } from '../../lib/grupo.js';

export default {
  command: ['kick', 'expulsar', 'echar'],
  category: 'grupo',
  desc: 'Expulsa un miembro del grupo',
  uso: '<@mención | número | responder>',
  run: async ({ msg, sock, args }) => {
    try {
      const g = await checkGroup(sock, msg);
      if (!g) return;
      const target = objetivoHumano(sock, msg, args);
      if (target && esBot(sock, target)) return msg.reply('❍ Conmigo no, que me quedo sin grupo.');
      if (!target) return msg.reply('❍ Responde al mensaje, menciona o escribe el número. Ej: *.kick* @usuario');
      if (baseJid(target) === baseJid(g.bot)) return msg.reply('❍ No puedo expulsarme a mí mismo.');
      await sock.groupParticipantsUpdate(msg.chat, [pidOf(g.meta, target)], 'remove');
      await new Promise((r) => setTimeout(r, 1500));
      const meta2 = await sock.groupMetadata(msg.chat).catch(() => null);
      if (meta2 && findParticipant(meta2, target)) {
        return msg.reply(`❍ No se pudo expulsar a @${baseJid(target)} (¿es admin o el creador?).`);
      }
      await msg.reply(`✿ *Expulsado »* @${baseJid(target)}\n\n> *${global.botname2} • ${global.dev}*`);
    } catch (e) {
      console.error('[kick]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
