import { put } from '@vercel/blob';
import { applyCors, handleOptions } from './_cors.js';

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidClientId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(value);
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return handleOptions(req, res);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Falta BLOB_READ_WRITE_TOKEN en Vercel. Crea un Blob store y añade el token.',
    });
  }

  const body = req.body || {};
  const clientId = String(body.clientId || '').trim();
  const keyword = String(body.keyword || '').trim().slice(0, 64);
  const score = Number(body.score);

  if (!isValidClientId(clientId)) {
    return res.status(400).json({ error: 'clientId inválido.' });
  }
  if (!keyword) {
    return res.status(400).json({ error: 'Falta la palabra.' });
  }
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'La nota debe ser un entero del 1 al 10.' });
  }

  const at = new Date().toISOString();
  const event = {
    clientId,
    keyword,
    score: Math.round(score),
    at,
  };

  const pathname = `drawchallenge/events/${at.replace(/[:.]/g, '-')}-${randomId()}.json`;

  try {
    await put(pathname, JSON.stringify(event), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'No se pudo guardar el envío.',
    });
  }

  return res.status(200).json({ ok: true });
}

export const config = {
  api: {
    bodyParser: true,
  },
};
