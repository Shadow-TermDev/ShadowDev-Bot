// .tiktok — por link descarga el video; por texto busca y envía álbum.
import fetch from 'node-fetch';
import { generateWAMessage, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sfetch } from '../../lib/stellar.js';

const UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';

async function byUrl(url) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA }
  }).then((r) => r.json());
  const d = res?.data;
  const dl = d?.play || d?.wmplay;
  const fotos = Array.isArray(d?.images) ? d.images.filter(Boolean) : [];
  if (res?.code !== 0 || (!dl && !fotos.length)) return null;
  if (!dl) return { fotos, caption: null };
  return {
    dl,
    caption:
      `• :･ﾟ⊹˚• \`『 TikTok-Download 』\` •˚⊹:･ﾟ•\n\n` +
      `✿ *Título »* ${d.title || 'Sin título'}\n` +
      `✿ *Autor »* @${d.author?.unique_id || d.author?.nickname || '?'}\n` +
      `✿ *Likes »* ${(d.digg_count || 0).toLocaleString()}\n\n` +
      `> *${global.botname2} • ${global.dev}*`
  };
}

async function sendAlbum(sock, chat, items) {
  const album = await generateWAMessageFromContent(
    chat,
    { albumMessage: { expectedVideoCount: items.length, expectedImageCount: 0 } },
    {}
  );
  await sock.relayMessage(chat, album.message, { messageId: album.key.id });
  for (const v of items) {
    const m = await generateWAMessage(
      chat,
      { video: { url: v.dl }, caption: v.caption },
      { upload: sock.waUploadToServer }
    );
    m.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
    await sock.relayMessage(chat, m.message, { messageId: m.key.id });
    await new Promise((r) => setTimeout(r, 800));
  }
}

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  desc: 'Baja videos o busca en TikTok',
  uso: '<url o texto>',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args.length) return msg.reply('❍ Envía un enlace o un texto para buscar. Ej: *.tiktok* https://vt.tiktok.com/...');
      const url = args.find((a) => a.includes('tiktok.com'));

      if (url) {
        await msg.react('🕒');
        const req = byUrl(url);
        await msg.reply('> ✐ _Descargando TikTok, espera..._');
        const v = await req;
        if (!v) return msg.reply('❍ No se pudo descargar (verifica que sea público).');
        if (v.fotos && !v.dl) {
          for (const f of v.fotos.slice(0, 5)) {
            await sock.sendMessage(msg.chat, { image: { url: f } }, { quoted: { key: msg.key, message: {} } });
          }
          await msg.react('✔️');
          return;
        }
        await sock.sendMessage(msg.chat, { video: { url: v.dl }, caption: v.caption }, { quoted: { key: msg.key, message: {} } });
        await msg.react('✔️');
        return;
      }

      const query = args.join(' ');
      await msg.reply('> ✐ _Buscando TikTok, espera..._');
      let videos = [];
      try {
        const res = await sfetch(`/search/tiktok?query=${encodeURIComponent(query)}`);
        const arr = res?.result || res?.data || [];
        if (Array.isArray(arr)) videos = arr;
      } catch (e) {
        console.error('[tiktok-search]', e?.message || e);
      }
      if (!videos.length) {
        return msg.reply('❍ Sin resultados, intenta con otras palabras o envía el link directo.');
      }
      let n = 0;
      const items = [];
      for (const v of videos.slice(0, 10)) {
        const dl = v?.dl || v?.play || v?.wmplay;
        if (!dl) continue;
        n++;
        const titulo = v.title || 'Sin título';
        const enlace = v.id ? `https://www.tiktok.com/@i/video/${v.id}` : query;
        items.push({ dl, caption: `✿ *${n}.* ${titulo}\n> ✐ ${enlace}` });
      }
      if (!items.length) return msg.reply('❍ Sin resultados descargables.');
      if (items.length === 1) {
        await sock.sendMessage(msg.chat, { video: { url: items[0].dl }, caption: items[0].caption }, { quoted: { key: msg.key, message: {} } });
      } else {
        await sendAlbum(sock, msg.chat, items);
      }
      await msg.react('✔️');
    } catch (e) {
      console.error('[tiktok]', e?.message || e);
      try {
        await msg.react('✖️');
      } catch {}
      await msg.reply(global.msgglobal);
    }
  }
};
