// .setbanner — cambia el banner del menú por URL (owner).
// El banner vive en tu web para no llenar la media de los chats.
export default {
  command: ['setbanner'],
  category: 'socket',
  desc: 'Cambia el banner del menú (owner)',
  uso: '<url>',
  run: async ({ msg, sock, args, isOwner }) => {
    try {
      if (!isOwner) return msg.reply(global.mess.socket);
      const value = args.join(' ').trim();
      if (value.startsWith('http')) {
        global.banner = value;
        return msg.reply(`❖ Banner actualizado.`);
      }
      const mm = msg.message || {};
      if (mm.imageMessage) {
        const buffer = await msg.download();
        if (!buffer) return msg.reply('❀ No se pudo descargar la imagen.');
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), 'banner.jpg');
        const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
        const url = (await res.text()).trim();
        if (!url.startsWith('https://')) return msg.reply('❀ No se pudo subir la imagen.');
        global.banner = url;
        return msg.reply(`❖ Banner actualizado:\n${url}`);
      }
      return msg.reply('❖ Usa *.setbanner <url>* o envía una imagen con *.setbanner* en el pie de foto.');
    } catch (e) {
      console.error('[setbanner]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
