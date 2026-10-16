// .sys — info del sistema donde corre el bot (solo owner).
// fromAgent: NO manda la tarjeta fría; retorna los datos y el agente narra
// la info con personalidad (plantilla de respaldo incluida en el agente).
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
  run: async ({ msg, sock, isOwner, fromAgent }) => {
    try {
      if (!isOwner) {
        if (fromAgent) return { ok: false, code: 'error', data: {}, detail: 'solo owner' };
        return msg.reply(global.mess.owner);
      }
      const mem = process.memoryUsage();
      const cmds = new Set([...(global.cmds?.values() || [])].map((c) => c.run)).size;
      const data = {
        version: pkg.version,
        node: `${process.version} (${process.platform} ${process.arch})`,
        uptime: fmt(Date.now() - (global.bootTime || Date.now())),
        ram: Math.round(mem.rss / 1048576),
        cmds,
        usuarios: global.seenUsers?.size || 0,
        conectado: sock.user?.name || '?'
      };
      if (fromAgent) return { ok: true, code: 'sys', data };
      await msg.reply(
        `• :･ﾟ⊹˚• \`『 Sistema 』\` •˚⊹:･ﾟ•\n\n` +
        `✿ *Bot »* ${global.botname} v${data.version}\n` +
        `✿ *Node »* ${data.node}\n` +
        `✿ *Activo »* ${data.uptime}\n` +
        `✿ *RAM »* ${data.ram} MB\n` +
        `✿ *Comandos »* ${data.cmds}\n` +
        `✿ *Usuarios vistos »* ${data.usuarios}\n` +
        `✿ *Conectado »* ${data.conectado}\n\n` +
        `> *${global.botname2} • ${global.dev}*`
      );
    } catch {
      if (fromAgent) return { ok: false, code: 'error', data: {}, detail: 'excepción' };
      await msg.reply(global.msgglobal);
    }
  }
};
