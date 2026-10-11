// Router de comandos con prefijos . / ! # (estilo Hutao).
import chalk from 'chalk';

const PREFIXES = ['.', '/', '!', '#'];

export default async function handler(sock, m) {
  try {
    const text = (m.body || '').trim();
    if (!text) return;
    const prefix = PREFIXES.find((p) => text.startsWith(p));
    if (!prefix) return;

    const [raw, ...rest] = text.slice(prefix.length).trim().split(/\s+/);
    if (!raw) return;
    const command = raw.toLowerCase();
    const args = rest;
    const cmdText = args.join(' ');

    const cmd = global.cmds?.get(command);
    if (!cmd) return;

    const isOwner = global.owner
      .map((n) => n + '@s.whatsapp.net')
      .includes(m.sender);

    await cmd.run({
      msg: m,
      m,
      sock,
      args,
      text: cmdText,
      command,
      prefix,
      usedPrefix: prefix,
      isOwner
    });
  } catch (e) {
    console.error(chalk.gray(`[ handler ] ${e?.message || e}`));
    try {
      await m.reply(global.msgglobal);
    } catch {}
  }
}
