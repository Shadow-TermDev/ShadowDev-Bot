// .chiste — chiste aleatorio en español (JokeAPI, gratis, sin key).
import fetch from 'node-fetch';

export default {
  command: ['chiste', 'joke', 'chistes'],
  category: 'fun',
  desc: 'Cuenta un chiste aleatorio',
  run: async ({ msg, sock }) => {
    try {
      const res = await fetch('https://v2.jokeapi.dev/joke/Any?lang=es&type=single&blacklistFlags=nsfw,racist,sexist').then((r) => r.json());
      if (res?.error || !res?.joke) return msg.reply('❍ No salió el chiste, intenta de nuevo.');
      await sock.sendMessage(
        msg.chat,
        { text: `• :･ﾟ⊹˚• \`『 Chiste 』\` •˚⊹:･ﾟ•\n\n> ✐ ${res.joke}\n\n> *${global.botname2} • ${global.dev}*` },
        { quoted: { key: msg.key, message: {} } }
      );
    } catch (e) {
      console.error('[chiste]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
