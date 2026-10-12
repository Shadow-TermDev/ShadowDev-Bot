// .gitclone — descarga un repo de GitHub como ZIP (URL directa, sin API).
import fetch from 'node-fetch';

export default {
  command: ['gitclone', 'clone', 'repo'],
  category: 'downloader',
  desc: 'Descarga un repo de GitHub en ZIP',
  uso: '<usuario/repo>',
  run: async ({ msg, sock, args }) => {
    try {
      const m = (args[0] || '').match(/github\.com\/([^/]+\/[^/]+)/i) || args.join('').match(/^([\w-]+\/[\w.-]+)$/);
      const repo = (m?.[1] || '').replace(/\/$/, '');
      if (!repo) return msg.reply('❍ Ejemplo: *.gitclone* Shadow-TermDev/ShadowDev-Bot');
      await msg.reply(`> ✐ _Descargando *${repo}*, espera..._`);
      for (const branch of ['main', 'master']) {
        const url = `https://github.com/${repo}/archive/refs/heads/${branch}.zip`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 1000) continue;
        await sock.sendMessage(
          msg.chat,
          { document: buf, mimetype: 'application/zip', fileName: `${repo.replace('/', '-')}-${branch}.zip` },
          { quoted: { key: msg.key, message: {} } }
        );
        return;
      }
      await msg.reply('❍ No se pudo descargar (revisa usuario/repo y rama).');
    } catch (e) {
      console.error('[gitclone]', e?.message || e);
      await msg.reply(global.msgglobal);
    }
  }
};
