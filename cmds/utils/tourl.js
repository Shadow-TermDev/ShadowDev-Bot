// .tourl — envía una imagen/video CON el comando en el pie de foto y devuelve su URL (Catbox).
// Reciclado de Megumin (uploadImage.ts) — sin APIs caídas.
export default {
  command: ['tourl'],
  category: 'utils',
  desc: 'Sube imagen/video y da su URL',
  run: async ({ msg, sock }) => {
    try {
      const mm = msg.message || {};
      const mediaMsg = mm.imageMessage || mm.videoMessage;
      if (!mediaMsg) {
        return msg.reply('❍ Envía una imagen o video con *.tourl* en el pie de foto.');
      }
      const buffer = await msg.download();
      if (!buffer) return msg.reply('❍ No se pudo descargar el archivo.');

      const mime = mediaMsg.mimetype || 'image/jpeg';
      const ext = (mime.split('/')[1] || 'bin').split(';')[0];
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', new Blob([buffer], { type: mime }), `upload.${ext}`);

      const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
      const url = (await res.text()).trim();
      if (!url.startsWith('https://')) throw new Error(url);

      const kb = (buffer.length / 1024).toFixed(1);
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Link-Enlace 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Enlace »* ${url}\n` +
        `✿ *Tamaño »* ${kb} KB\n` +
        `✿ *Tipo »* ${mime}\n\n` +
        `> ✐ *${global.dev}*`
      );
    } catch (e) {
      console.error('[tourl]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
