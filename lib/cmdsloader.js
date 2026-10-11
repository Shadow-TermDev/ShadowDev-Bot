// Cargador de comandos estilo Hutao/Megumin.
// Cada archivo en cmds/**/*.js exporta: { command: [], category, desc, uso?, run }
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

global.cmds = new Map(); // alias (minúsculas) -> comando

export default async function cmdsLoader() {
  const base = path.join(process.cwd(), 'cmds');
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) files.push(p);
    }
  };
  if (!fs.existsSync(base)) return;
  walk(base);

  let total = 0;
  for (const f of files) {
    try {
      const mod = await import(pathToFileURL(f).href + `?t=${Date.now()}`);
      const cmd = mod.default;
      if (!cmd?.command?.length || typeof cmd.run !== 'function') continue;
      const entry = {
        alias: cmd.command.map((c) => String(c).toLowerCase()),
        category: cmd.category || 'otros',
        desc: cmd.desc || '',
        uso: cmd.uso || '',
        run: cmd.run,
        file: f
      };
      for (const a of entry.alias) {
        if (!global.cmds.has(a)) {
          global.cmds.set(a, entry);
          total++;
        }
      }
    } catch (e) {
      console.log(chalk.gray(`[ cmds ] Error en ${f}: ${e.message}`));
    }
  }
  console.log(chalk.gray(`[ ✿ ] ${total} alias / ${files.length} archivos cargados`));
}
