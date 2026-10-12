// .8ball — bola mágica (local, instantáneo).
const RESPUESTAS = [
  'Sí, de una. ✅', 'Nel, ni lo intentes. ❌', 'Puede ser... 🔮', 'Pregunta de nuevo más tarde. ⏳',
  'Todo apunta a que sí. ✨', 'Mejor no te digo. 🤫', 'Obvio que sí. 💯', 'Uy, eso pinta mal. 🌧️',
  'Dale sin miedo. 🚀', 'La respuesta está en tu corazón. 💘', 'Sí, pero con calma. 🍃', 'Ja! Buena esa. 😅'
];

export default {
  command: ['8ball', 'bola', 'pregunta'],
  category: 'fun',
  desc: 'La bola mágica responde',
  uso: '<pregunta>',
  run: async ({ msg, args }) => {
    if (!args.length) return msg.reply('❍ Hazme una pregunta. Ej: *.8ball* ¿apruebo mañana?');
    const r = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)];
    await msg.reply(`• :･ﾟ⊹˚• \`『 Bola Mágica 』\` •˚⊹:･ﾟ•\n\n✿ *Pregunta »* ${args.join(' ')}\n✿ *Respuesta »* ${r}\n\n> *${global.botname2} • ${global.dev}*`);
  }
};
