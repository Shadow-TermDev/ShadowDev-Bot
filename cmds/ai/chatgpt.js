// .ia — ChatGPT vía API Stellar (reciclado de Hutao).
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
      const res = await fetch(
        `${global.api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${global.api.key}`
      ).then((r) => r.json());
      if (!res?.result) return msg.reply('✎ No se pudo obtener una respuesta válida.');
      await sock.sendMessage(msg.chat, { text: String(res.result).trim() }, { quoted: { key: msg.key, message: {} } });
    } catch (e) {
      console.error('[ia]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
