// .setbanner — cambia el banner del menú con una URL o imagen adjunta.
// Sin dix.lat: acepta URL directa o usa la imagen local enviada.
import fs from 'fs';

export default {
  command: ['setbanner'],
  category: 'socket',
  desc: 'Cambia el banner del menú (owner)',
  run: async ({ msg, sock, args, isOwner }) => {
    try {
      if (!isOwner) return msg.reply(global.mess.socket);
      const value = args.join(' ').trim();
      if (value.startsWith('http')) {
        global.banner = value;
        return msg.reply(`❖ Banner actualizado a URL externa.`);
      }
      const mm = msg.message || {};
      if (mm.imageMessage) {
        const buffer = await msg.download();
        if (!buffer) return msg.reply('❀ No se pudo descargar la imagen.');
        fs.writeFileSync('./media/banner.png', buffer);
        global.banner = './media/banner.png';
        return msg.reply(`❖ Banner actualizado desde imagen adjunta.`);
      }
      return msg.reply('❖ Envía *.setbanner <url>* o una imagen con *.setbanner* en el pie de foto.');
    } catch (e) {
      console.error('[setbanner]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
