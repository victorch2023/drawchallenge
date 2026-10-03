import { generateText } from './localModel.js';

const COMMENTS = {
  1: [
    (word) => `¡Buen primer intento! Aún no se ve «${word}», pero ya empezaste. Prueba otra vez.`,
    (word) => `Vas a lograrlo. Dale forma a «${word}» con un trazo más claro.`,
    (word) => `Ánimo: el lienzo te espera. Dibuja «${word}» con calma y sin prisa.`,
    (word) => `Cada trazo cuenta. Intenta marcar la silueta de «${word}».`,
    (word) => `¡Sigue! Un par de líneas bien puestas y «${word}» empezará a aparecer.`,
    (word) => `No te rindas. Piensa en «${word}» y dibuja su forma más simple.`,
    (word) => `Estás en el camino. Dale otra oportunidad a «${word}»: tú puedes.`,
  ],
  2: [
    (word) => `Hay movimiento, ¡bien! Ahora busca que se note más «${word}».`,
    (word) => `Vas avanzando. Añade un rasgo típico de «${word}» y se entenderá mejor.`,
    (word) => `Buen esfuerzo. Con un poco más de forma, «${word}» se asomará.`,
    (word) => `Se nota que lo intentaste. Prueba la silueta básica de «${word}».`,
    (word) => `¡Ánimo! Estás cerca de empezar: un detalle más y «${word}» cobra vida.`,
    (word) => `Sigue practicando. «${word}» necesita una forma un poquito más clara.`,
    (word) => `Vas bien por intentarlo. Dale un segundo boceto a «${word}».`,
  ],
  3: [
    (word) => `¡Buen intento! «${word}» aún se esconde, pero el trazo ya tiene energía.`,
    (word) => `Vas por buen camino. Marca mejor la forma principal de «${word}».`,
    (word) => `Se ve esfuerzo. Un rasgo clave más y «${word}» se reconocerá.`,
    (word) => `Ánimo: ya hay líneas. Ayuda a «${word}» con su silueta más simple.`,
    (word) => `Casi arranca. Piensa en lo más fácil de dibujar de «${word}».`,
    (word) => `¡Sigue así! Con un poco más de claridad, «${word}» se entiende.`,
    (word) => `Buen comienzo creativo. Dale una forma más definida a «${word}».`,
  ],
  4: [
    (word) => `¡Se asoma! «${word}» pide un poquito más de forma para brillar.`,
    (word) => `Vas muy bien. Un detalle típico y «${word}» se verá más claro.`,
    (word) => `Hay una pista linda de «${word}». Sigue: ya casi se lee.`,
    (word) => `Buen progreso. Completa un rasgo más de «${word}» y listo.`,
    (word) => `Se siente la idea de «${word}». Ánimo: estás cerca.`,
    (word) => `¡Sigue! Con un poco más de definición, «${word}» se entiende mejor.`,
    (word) => `Buen boceto inicial. Dale cuerpo a «${word}» con calma.`,
  ],
  5: [
    (word) => `¡Ya se intuye «${word}»! Un par de detalles y quedará más claro.`,
    (word) => `Vas a mitad de camino. «${word}» está ahí: dale un empujoncito más.`,
    (word) => `Buen trabajo. Se lee «${word}» a medias; un rasgo más ayuda mucho.`,
    (word) => `Se nota el esfuerzo. «${word}» casi se reconoce: ¡sigue!`,
    (word) => `¡Ánimo! Con un detalle clave, «${word}» se entiende del todo.`,
    (word) => `Vas bien. Aclara un poquito la forma de «${word}» y ganas.`,
    (word) => `Hay progreso real. «${word}» asoma: completa lo que falta.`,
  ],
  6: [
    (word) => `¡Se reconoce «${word}»! Buen trabajo. Un detalle más lo haría brillar.`,
    (word) => `Muy bien: ya se entiende «${word}». Puedes afinar un borde si quieres.`,
    (word) => `Buen dibujo. «${word}» se ve; sigue sumando confianza al trazo.`,
    (word) => `¡Vas genial! «${word}» está claro a medias: un toque más y queda redondo.`,
    (word) => `Se nota tu avance. «${word}» funciona; ¡ánimo para el siguiente!`,
    (word) => `Buen resultado. Quien mire puede ver «${word}». Sigue así.`,
    (word) => `¡Bien hecho! «${word}» ya tiene presencia. Un detalle extra lo eleva.`,
  ],
  7: [
    (word) => `¡Muy bien! «${word}» se entiende claro. Buen ritmo de dibujo.`,
    (word) => `Buen trabajo: «${word}» se reconoce. Estás dibujando con seguridad.`,
    (word) => `Se ve «${word}» sin problema. ¡Sigue con esa confianza!`,
    (word) => `¡Qué bien! «${word}» está legible y con buena intención.`,
    (word) => `Excelente esfuerzo. «${word}» se adivina fácil: vas por buen camino.`,
    (word) => `«${word}» queda claro. Un detalle fino más y brillaría aún más.`,
    (word) => `¡Ánimo y felicidades! «${word}» se entiende; sigue practicando.`,
  ],
  8: [
    (word) => `¡Qué bonito! «${word}» se ve muy claro. Excelente trabajo.`,
    (word) => `Muy bien logrado: cualquiera reconocería «${word}». ¡Sigue así!`,
    (word) => `«${word}» está limpio y reconocible. Se nota tu cuidado.`,
    (word) => `¡Genial! «${word}» se lee de un vistazo. Buen trazo.`,
    (word) => `Excelente. «${word}» convence y se entiende sin esfuerzo.`,
    (word) => `Muy claro «${word}». Tu dibujo comunica con facilidad.`,
    (word) => `¡Bravo! «${word}» se reconoce rápido. Estás dibujando muy bien.`,
  ],
  9: [
    (word) => `¡Impresionante! «${word}» se adivina al instante. Qué buen dibujo.`,
    (word) => `Excelente claridad: «${word}» se ve nítido. ¡Felicidades!`,
    (word) => `Cualquiera diría «${word}» enseguida. Estás dibujando genial.`,
    (word) => `«${word}» está sólido y claro. Qué bonito resultado.`,
    (word) => `Casi perfecto. «${word}» se explica solo: ¡sigue así!`,
    (word) => `Muy nítido. «${word}» no necesita explicación. Gran trabajo.`,
    (word) => `¡Qué logro! Se nombra «${word}» de inmediato. Orgullo merecido.`,
  ],
  10: [
    (word) => `¡Diez! «${word}» se entiende a la primera. Eres un crack dibujando.`,
    (word) => `Perfecto: «${word}» es obvio y claro. ¡Felicidades de verdad!`,
    (word) => `Sin duda es «${word}». Un dibujo limpio y muy logrado.`,
    (word) => `«${word}» gana la ronda. Qué claridad tan linda.`,
    (word) => `Nota máxima merecida. «${word}» se ve de un vistazo. ¡Bravo!`,
    (word) => `El «${word}» quedó redondo. Nada le falta: excelente trabajo.`,
    (word) => `¡Qué talento! «${word}» se adivina al instante. Sigue dibujando.`,
  ],
};

function bandFor(score) {
  return String(score);
}

export function commentForScore(score, keyword) {
  const word = String(keyword || 'dibujo').trim();
  const options = COMMENTS[bandFor(score)];
  const index = Math.floor(Math.random() * options.length);
  return options[index](word);
}

function buildPrompt(keyword) {
  return `The player had to draw: "${keyword}".
Look at the sketch and score only how recognizable it is.
1 means unrecognizable. 10 means anyone would guess it instantly.
Reply with a single integer from 1 to 10 and nothing else.
RESPUESTA:`;
}

function parseScore(text) {
  const match = String(text || '').match(/\b(10|[1-9])\b/);
  const score = match ? Number(match[1]) : 4;
  return Math.min(10, Math.max(1, score));
}

export async function evaluateDrawing(keyword, imageBase64) {
  const text = await generateText({
    prompt: buildPrompt(keyword),
    imageDataUrl: `data:image/png;base64,${imageBase64}`,
    maxNewTokens: 8,
  });
  const score = parseScore(text);
  return {
    score,
    reason: commentForScore(score, keyword),
    keyword,
  };
}
