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
  msg.quoted = mm.extendedTextMessage?.contextInfo?.quotedMessage || null;
  msg.quotedSender = mm.extendedTextMessage?.contextInfo?.participant || null;
  msg.mentionedJid = mm.extendedTextMessage?.contextInfo?.mentionedJid || [];

  msg.reply = (text, opts = {}) =>
    sock.sendMessage(msg.chat, { text: String(text), ...opts }, { quoted: m });

  msg.download = async () => {
    try {
      const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
      return await downloadMediaMessage(m, 'buffer', {});
    } catch {
      return null;
    }
  };

  return msg;
}

export async function getBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
