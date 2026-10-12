// Helpers de grupos (puros Baileys, sin APIs ni DB).
export function baseJid(jid) {
  return String(jid || '').split('@')[0].split(':')[0];
}

export function botJid(sock) {
  return (sock.user?.id || '').split(':')[0] + '@s.whatsapp.net';
}

export function findParticipant(meta, jid) {
  const b = baseJid(jid);
  return (meta?.participants || []).find((p) =>
    [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean).some((x) => baseJid(x) === b)
  );
}

export function pidOf(meta, jid) {
  return findParticipant(meta, jid)?.id || jid;
}

// Número real aunque el JID sea LID (busca en participantes del grupo)
export function phoneOf(meta, jid) {
  const p = findParticipant(meta, jid);
  const phone = p?.phoneNumber || (p?.id?.endsWith('@s.whatsapp.net') ? p.id : null);
  return (phone || jid || '').split('@')[0].split(':')[0];
}

// Resolución completa: mapping Baileys → metadata → base. Nunca revienta.
export async function realPhone(sock, chat, jid) {
  const base = baseJid(jid);
  if (String(jid || '').endsWith('@s.whatsapp.net')) return base;
  try {
    const pn = await sock.signalRepository?.lidMapping?.getPNForLID(jid.includes('@') ? jid : `${jid}@lid`);
    if (pn) return baseJid(pn);
  } catch {}
  if (String(chat || '').endsWith('@g.us')) {
    try {
      const meta = await sock.groupMetadata(chat);
      const p = phoneOf(meta, jid);
      if (p && p !== base) return p;
    } catch {}
  }
  return base;
}

export function isAdminOf(meta, jid) {
  const p = findParticipant(meta, jid);
  return p?.admin === 'admin' || p?.admin === 'superadmin';
}

// Verifica grupo + admin remitente + bot admin. Responde el error y devuelve null si falla.
export async function checkGroup(sock, msg) {
  if (!msg.isGroup) {
    await msg.reply('❍ Este comando solo funciona en *grupos*.');
    return null;
  }
  let meta;
  try {
    meta = await sock.groupMetadata(msg.chat);
  } catch {
    await msg.reply('❍ No pude leer los datos del grupo.');
    return null;
  }
  if (!isAdminOf(meta, msg.sender)) {
    await msg.reply(global.mess.admin);
    return null;
  }
  if (!isAdminOf(meta, botJid(sock))) {
    await msg.reply(global.mess.botAdmin);
    return null;
  }
  return { meta, bot: botJid(sock) };
}

// Resuelve objetivo: citado > mencionado > número.
export function resolveTarget(msg, args) {
  if (msg.quotedSender) return msg.quotedSender;
  if (msg.mentionedJid?.length) return msg.mentionedJid[0];
  const num = (args[0] || '').replace(/\D/g, '');
  if (num.length >= 10) return num + '@s.whatsapp.net';
  return null;
}
