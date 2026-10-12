// .qr — genera un QR legible con cualquier texto/link (librería qrcode, local).
import QRCode from 'qrcode';

export default {
  command: ['qr', 'codigoqr'],
  category: 'utils',
  desc: 'Crea un QR de un texto o link',
  uso: '<texto>',
  run: async ({ msg, sock, args }) => {
    try {
      const text = args.join(' ');
      if (!text) return msg.reply('❍ Escribe algo. Ej: *.qr* https://Shadow-TermDev.github.io');
      if (text.length > 500) return msg.reply('❍ Muy largo, máximo 500 caracteres.');
      const buf = await QRCode.toBuffer(text, { width: 512, margin: 2 });
      await sock.sendMessage(
        msg.chat,
        { image: buf, caption: `• :･ﾟ⊹˚• \`『 QR 』\` •˚⊹:･ﾟ•\n\n✿ *Contenido »* ${text.slice(0, 100)}\n\n> *${global.botname2} • ${global.dev}*
> ${global.link}` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[qr]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
