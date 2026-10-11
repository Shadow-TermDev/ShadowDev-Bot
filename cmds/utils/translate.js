// .translate — Google Translate gratis + MyMemory (reemplaza delirius caído).
import fetch from 'node-fetch';

export default {
  command: ['translate', 'tr'],
  category: 'utils',
  desc: 'Traduce texto a otro idioma',
  uso: '<idioma> <texto>',
  run: async ({ msg, sock, args }) => {
    try {
      const language = args[0] || 'es';
      const text = args.slice(1).join(' ') || msg.quoted?.extendedTextMessage?.text || '';
      if (!text) return msg.reply('❍ Ejemplo: *.translate en* hola mundo');
      let out = '';
      try {
        const g = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(text)}`
        ).then((r) => r.json());
        out = g?.[0]?.map((p) => p[0]).join('') || '';
      } catch {}
      if (!out) {
        const m = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${encodeURIComponent(language)}`
        ).then((r) => r.json());
        out = m?.responseData?.translatedText || '';
      }
      if (!out) return msg.reply('❍ No se pudo traducir el texto.');
      await sock.sendMessage(
        msg.chat,
        { text: `• :･ﾟ⊹˚• \`『 Traductor 』\` •˚⊹:･ﾟ•\n\nᰔᩚ *${language}* » ${out}` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
