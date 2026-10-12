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
    [p.id, p.lid, p.phoneNumber].filter(Boolean).some((x) => baseJid(x) === b)
  );
}

export function pidOf(meta, jid) {
  return findParticipant(meta, jid)?.id || jid;
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
