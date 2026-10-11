// Descargas de YouTube vía SaveTube (reciclado de Megumin, verificado funcionando).
// Sin keys, sin Stellar caído.
import axios from 'axios';
import crypto from 'crypto';

const KY = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
const IDRE = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:live\/)?([a-zA-Z0-9_-]{11})/;

const client = axios.create({
  headers: {
    'content-type': 'application/json',
    origin: 'https://yt.savetube.me',
    'user-agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
  },
  timeout: 30000
});

function decrypt(enc) {
  const sr = Buffer.from(enc, 'base64');
  const ky = Buffer.from(KY, 'hex');
  const dc = crypto.createDecipheriv('aes-128-cbc', ky, sr.slice(0, 16));
  return JSON.parse(Buffer.concat([dc.update(sr.slice(16)), dc.final()]).toString());
}

async function convert(url, isAudio) {
  const id = url.match(IDRE)?.[3];
  if (!id) throw new Error('URL de YouTube inválida');
  const { data } = await client.get('https://media.savetube.vip/api/random-cdn');
  const cdn = data.cdn;
  const info = await client.post(`https://${cdn}/v2/info`, {
    url: `https://www.youtube.com/watch?v=${id}`
  });
  const dec = decrypt(info.data.data);
  const dl = await client.post(`https://${cdn}/download`, {
    id,
    downloadType: isAudio ? 'audio' : 'video',
    quality: isAudio ? '128' : '720',
    key: dec.key
  });
  const dlUrl = dl.data?.data?.downloadUrl;
  if (!dlUrl) throw new Error('Sin URL de descarga');
  return { dl: dlUrl, title: dec.title || '' };
}

// Reintenta con CDN fresco (2 intentos) — la red móvil falla seguido.
export async function downloadAudio(url) {
  let last;
  for (let i = 0; i < 2; i++) {
    try {
      return await convert(url, true);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

export async function downloadVideo(url) {
  let last;
  for (let i = 0; i < 2; i++) {
    try {
      return await convert(url, false);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}
