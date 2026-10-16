// .sys — info del sistema donde corre el bot (solo owner).
import os from 'os';
import pkg from '../../package.json' with { type: 'json' };

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return [d && `${d}d`, `${h % 24}h`, `${m % 60}m`, `${s % 60}s`].filter(Boolean).join(' ');
}

export default {
  command: ['sys', 'sistema', 'info-sys'],
  category: 'owner',
  access: 'owner',
  desc: 'Info del sistema del bot',
  run: async ({ msg, sock, isOwner }) => {
    try {
      if (!isOwner) return msg.reply(global.mess.owner);
      const mem = process.memoryUsage();
      const cmds = new Set([...(global.cmds?.values() || [])].map((c) => c.run)).size;
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Sistema 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Bot »* ${global.botname} v${pkg.version}\n` +
        `✿ *Node »* ${process.version} (${process.platform} ${process.arch})\n` +
        `✿ *Activo »* ${fmt(Date.now() - (global.bootTime || Date.now()))}\n` +
        `✿ *RAM »* ${Math.round(mem.rss / 1048576)} MB\n` +
        `✿ *Comandos »* ${cmds}\n` +
        `✿ *Usuarios vistos »* ${global.seenUsers?.size || 0}\n` +
        `✿ *Conectado »* ${sock.user?.name || '?'}\n\n` +
        `> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      await msg.reply(global.msgglobal);
    }
  }
};
