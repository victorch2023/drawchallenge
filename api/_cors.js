const DEFAULT_ORIGINS = [
  'https://victorch2023.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
];

export function allowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ORIGINS;
}

export function applyCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = allowedOrigins();
  const match =
    allowed.includes('*') ||
    (origin && allowed.some((o) => origin === o || origin.startsWith(o)));

  if (match && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowed[0] && allowed[0] !== '*') {
    res.setHeader('Access-Control-Allow-Origin', allowed[0]);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

export function handleOptions(req, res) {
  applyCors(req, res);
  res.status(204).end();
}
