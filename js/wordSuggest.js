import { addWordToHistory, getActiveKeyword, getWordHistory } from './storage.js';

export const DRAWABLE_WORDS = [
  'gato', 'perro', 'pez', 'pájaro', 'tortuga', 'conejo', 'elefante', 'jirafa',
  'serpiente', 'mariposa', 'abeja', 'pulpo', 'rana', 'pato', 'gallina', 'caballo',
  'vaca', 'cerdo', 'oveja', 'león', 'oso', 'pingüino', 'caracol', 'ratón',
  'casa', 'sol', 'luna', 'estrella', 'árbol', 'flor', 'coche', 'bicicleta',
  'barco', 'avión', 'tren', 'sombrero', 'gafas', 'reloj', 'llave', 'libro',
  'taza', 'plato', 'silla', 'mesa', 'cama', 'puerta', 'ventana', 'escalera',
  'paraguas', 'globo', 'pelota', 'guitarra', 'zapato', 'mochila', 'helado', 'manzana',
  'plátano', 'pizza', 'pastel', 'huevo', 'zanahoria', 'montaña', 'puente', 'castillo',
  'faro', 'cohete', 'nube', 'rayo', 'bandera', 'corona', 'espada', 'ancla',
  'semáforo', 'autobús', 'camión', 'moto', 'helicóptero', 'robot', 'florero', 'lápiz',
  'tijeras', 'martillo', 'cepillo', 'jabón', 'toalla', 'almohada', 'lámpara', 'televisor',
  'cámara', 'balón', 'raqueta', 'patín', 'cometa', 'tela de araña', 'hueso', 'queso',
];

function pickWord() {
  const recent = new Set(getWordHistory().map((word) => word.toLowerCase()));
  const current = getActiveKeyword().toLowerCase();
  let pool = DRAWABLE_WORDS.filter(
    (word) => word.toLowerCase() !== current && !recent.has(word.toLowerCase())
  );
  if (pool.length === 0) {
    pool = DRAWABLE_WORDS.filter((word) => word.toLowerCase() !== current);
  }
  if (pool.length === 0) pool = DRAWABLE_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function suggestDrawingWord() {
  const word = pickWord();
  addWordToHistory(word);
  return { word, hint: '' };
}
