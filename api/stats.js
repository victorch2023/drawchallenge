import { list } from '@vercel/blob';
import { applyCors, handleOptions } from './_cors.js';

function authorized(req) {
  const expected = process.env.ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const query = typeof req.query?.token === 'string' ? req.query.token.trim() : '';
  return bearer === expected || query === expected;
}

function aliasMap(events) {
  const firstSeen = new Map();
  for (const event of events) {
    const id = event.clientId;
    if (!id) continue;
    const prev = firstSeen.get(id);
    if (!prev || event.at < prev) firstSeen.set(id, event.at);
  }

  const ordered = [...firstSeen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const aliases = new Map();
  ordered.forEach(([id], index) => {
    aliases.set(id, `usuario${index + 1}`);
  });
  return aliases;
}

async function loadEvents() {
  const events = [];
  let cursor;
  do {
    const page = await list({
      prefix: 'drawchallenge/events/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      cursor,
      limit: 1000,
    });

    for (const blob of page.blobs) {
      try {
        const response = await fetch(blob.url);
        if (!response.ok) continue;
        const data = await response.json();
        if (data?.clientId && data?.keyword && data?.score != null && data?.at) {
          events.push({
            clientId: String(data.clientId),
            keyword: String(data.keyword),
            score: Number(data.score),
            at: String(data.at),
          });
        }
      } catch {
        // skip corrupt blobs
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Falta BLOB_READ_WRITE_TOKEN en Vercel.',
    });
  }
  if (!process.env.ADMIN_TOKEN) {
    return res.status(503).json({
      error: 'Falta ADMIN_TOKEN en Vercel. Elige una contraseña y guárdala como variable de entorno.',
    });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Token de admin incorrecto.' });
  }

  try {
    const events = await loadEvents();
    const aliases = aliasMap(events);
    const rows = events.map((event) => ({
      user: aliases.get(event.clientId) || 'usuario?',
      keyword: event.keyword,
      score: event.score,
      at: event.at,
    }));

    const uniqueUsers = aliases.size;
    const avg =
      rows.length > 0
        ? Math.round((rows.reduce((sum, row) => sum + row.score, 0) / rows.length) * 10) / 10
        : 0;

    return res.status(200).json({
      summary: {
        submissions: rows.length,
        users: uniqueUsers,
        averageScore: avg,
      },
      rows,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'No se pudieron leer las estadísticas.',
    });
  }
}
