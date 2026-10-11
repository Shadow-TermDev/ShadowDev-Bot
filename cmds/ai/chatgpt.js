// .ia — vía Pollinations (gratis, sin key, reemplaza Stellar muerto).
import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ai',
  desc: 'Pregunta a la IA',
  uso: '<pregunta>',
  run: async ({ msg, sock, args }) => {
    try {
      const text = args.join(' ');
      if (!text) return msg.reply('✎ Escribe una petición. Ej: *.ia* ¿quién eres?');
      await msg.reply('✎ *IA* procesando tu respuesta...');
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 90000);
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(text)}`, { signal: ctrl.signal });
      clearTimeout(t);
      const out = (await res.text()).trim();
      if (!out) return msg.reply('✎ La IA no respondió, intenta de nuevo.');
      await sock.sendMessage(msg.chat, { text: out }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[ia]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
