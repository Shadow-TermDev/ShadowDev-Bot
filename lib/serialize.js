// Serialización mínima de mensajes (reciclada de Hutao, simplificada).
export async function smsg(sock, m) {
  const msg = {};
  msg.key = m.key;
  msg.chat = m.key.remoteJid;
  msg.sender = m.key.participant || m.key.remoteJid;
  msg.fromMe = !!m.key.fromMe;
  msg.isGroup = msg.chat?.endsWith('@g.us');
  msg.pushName = m.pushName || '';
  msg.message = m.message || {};

  const mm = msg.message;
  msg.text =
    mm.conversation ||
    mm.extendedTextMessage?.text ||
    mm.imageMessage?.caption ||
    mm.videoMessage?.caption ||
    '';
  msg.body = msg.text;
  const ctx =
    mm.extendedTextMessage?.contextInfo ||
    mm.imageMessage?.contextInfo ||
    mm.videoMessage?.contextInfo ||
    {};
  msg.quoted = ctx.quotedMessage || null;
  msg.quotedSender = ctx.participant || null;
  msg.quotedKey = ctx.stanzaId
    ? { remoteJid: msg.chat, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || undefined }
    : null;
  msg.mentionedJid = ctx.mentionedJid || [];

  msg.reply = (text, opts = {}) =>
    sock.sendMessage(msg.chat, { text: String(text), ...opts }, { quoted: m });

  msg.react = (emoji) =>
    sock.sendMessage(msg.chat, { react: { text: String(emoji), key: m.key } }).catch(() => {});

  msg.download = async () => {
    try {
      const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
      return await downloadMediaMessage(m, 'buffer', {});
    } catch {
      return null;
    }
  };

  // Descarga el mensaje CITADO (para .s con réplica y similares)
  msg.downloadQuoted = async () => {
    try {
      if (!msg.quoted || !msg.quotedKey) return null;
      const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
      return await downloadMediaMessage({ key: msg.quotedKey, message: msg.quoted }, 'buffer', {});
    } catch {
      return null;
    }
  };

  return msg;
}

export async function getBuffer(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
