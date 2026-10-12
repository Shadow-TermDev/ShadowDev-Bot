// .ia — pregunta a la IA (Pollinations, gratis, sin key). Edita el mensaje.
import { preguntarIA } from '../../lib/ia.js';

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ai',
  desc: 'Habla con la IA',
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
      const out = (await preguntarIA(text, undefined, 90000))?.trim();
      if (!out || /^\s*\{[^}]*\}\s*$/.test(out)) {
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
