// IA compartida (Pollinations, gratis, sin key).
import fetch from 'node-fetch';

export const SYSTEM_BOT = `Eres ShadowDev, el bot juguetón del grupo de WhatsApp Shadow-TermDev. Respondes en español, corto (máximo 2 líneas), con humor sano y uno que otro emoji. Si te preguntan qué sabes hacer, diles que usen el comando .menu. Nunca digas que eres ChatGPT ni otro modelo.`;

export async function preguntarIA(texto, system = SYSTEM_BOT, timeoutMs = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `https://text.pollinations.ai/${encodeURIComponent(texto)}?system=${encodeURIComponent(system)}`;
    const res = await fetch(url, { signal: ctrl.signal });
    return (await res.text()).trim();
  } finally {
    clearTimeout(t);
  }
}
