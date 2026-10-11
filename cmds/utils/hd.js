// .hd — mejora la calidad de una imagen (reciclado de Hutao).
// Envía la imagen CON .hd en el pie de foto. Sube a Uguu/Catbox y usa Stellar upscale.
import fetch from 'node-fetch';

async function upload(buffer) {
  const form = new FormData();
  form.append('files[]', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
  try {
    const r = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form }).then((x) => x.json());
    if (r?.files?.[0]?.url) return r.files[0].url;
  } catch {}
  const f2 = new FormData();
  f2.append('reqtype', 'fileupload');
  f2.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
  const r2 = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: f2 }).then((x) => x.text());
  return r2.trim().startsWith('https://') ? r2.trim() : null;
}

export default {
  command: ['hd', 'upscale', 'mejorar'],
  category: 'utils',
  desc: 'Mejora la calidad de una imagen',
  run: async ({ msg, sock, prefix }) => {
    try {
      const mm = msg.message || {};
      if (!mm.imageMessage) return msg.reply(`✐ Envía una *imagen* con *${prefix}hd* en el pie de foto.`);
      const buffer = await msg.download();
      if (!buffer) return msg.reply('✐ No se pudo descargar la imagen.');
      await msg.reply('✐ *Mejorando* imagen, espera...');
      const url = await upload(buffer);
      if (!url) return msg.reply('✐ No se pudo subir la imagen.');
      const res = await fetch(`${global.api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${global.api.key}`);
      if (!res.ok) return msg.reply('✎ No se pudo mejorar la imagen.');
      const out = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(msg.chat, { image: out, caption: `> *${global.botname2} HD*` }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[hd]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
