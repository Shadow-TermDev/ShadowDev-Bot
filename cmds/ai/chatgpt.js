// .ia — vía Pollinations (gratis, sin key). Edita el mensaje (no duplica).
import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ai',
  desc: 'Pregunta a la IA',
  uso: '<pregunta>',
  run: async ({ msg, sock, args }) => {
    try {
      const text = args.join(' ');
      if (!text) return msg.reply('❍ Escribe una petición. Ej: *.ia* ¿quién eres?');
      const { key } = await sock.sendMessage(
        msg.chat,
        { text: '> ✦ _La IA está procesando tu respuesta..._' },
        { quoted: { key: msg.key, message: {} } }
      );
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 90000);
      let out = '';
      try {
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}`, { signal: ctrl.signal });
        out = (await res.text()).trim();
      } finally {
        clearTimeout(t);
      }
      if (!out) {
        await sock.sendMessage(msg.chat, { text: '❍ La IA no respondió, intenta de nuevo.', edit: key });
        return;
      }
      try {
        await sock.sendMessage(msg.chat, { text: out, edit: key });
      } catch {
        await sock.sendMessage(msg.chat, { text: out }, { quoted: { key: msg.key, message: {} } });
      }
    } catch (e) {
      console.error('[ia]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
