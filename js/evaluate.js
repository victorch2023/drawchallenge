import { generateText } from './localModel.js';

const COMMENTS = {
  1: [
    (word) => `«${word}» no aparece. El papel sigue casi en blanco.`,
    (word) => `No hay «${word}» a la vista. Solo un gesto suelto.`,
    (word) => `Esto no sugiere «${word}». El jurado no encuentra el objeto.`,
    (word) => `«${word}» brilla por su ausencia. Hay que empezar de nuevo.`,
    (word) => `Ni un rasgo de «${word}». Parece un calentamiento.`,
    (word) => `El «${word}» se quedó en la imaginación. En el lienzo no está.`,
    (word) => `Cero pista de «${word}». El trazo no nombra nada.`,
  ],
  2: [
    (word) => `Apenas hay líneas, y ninguna dice «${word}».`,
    (word) => `Se ve un garabato, no un «${word}».`,
    (word) => `Muy lejos de «${word}». Faltan casi todas las formas.`,
    (word) => `Dos trazos no arman un «${word}». Sigue en blanco la idea.`,
    (word) => `Si ahí hay un «${word}», está muy bien escondido.`,
    (word) => `El «${word}» no arranca. El dibujo todavía no propone nada.`,
    (word) => `Queda en intento. «${word}» no se deja ver.`,
  ],
  3: [
    (word) => `«${word}» no se reconoce. El lápiz y tú guardan un secreto.`,
    (word) => `«${word}» no se entiende. El jurado pide una pista escrita.`,
    (word) => `Falta «${word}». Sobran trazos que no cuentan nada.`,
    (word) => `Podría ser otra cosa. «${word}» no convence.`,
    (word) => `La forma no cierra. «${word}» se pierde entre las líneas.`,
    (word) => `Hay rayas, no un «${word}». Hace falta el objeto de verdad.`,
    (word) => `El jurado frunce el ceño: «${word}» no está en este boceto.`,
  ],
  4: [
    (word) => `«${word}» se intuye a duras penas, y solo con buena voluntad.`,
    (word) => `Una pista mínima de «${word}». El resto no ayuda.`,
    (word) => `Se adivina poco. «${word}» pide más forma y menos prisa.`,
    (word) => `Hay un gesto hacia «${word}», todavía muy incompleto.`,
    (word) => `Casi nada delata a «${word}». Falta el rasgo principal.`,
    (word) => `Se asoma «${word}» y se esconde. El boceto sigue verde.`,
    (word) => `Contexto y fe: solo así aparece «${word}».`,
  ],
  5: [
    (word) => `«${word}» se intuye, pero hace falta entrecerrar los ojos.`,
    (word) => `Hay un «${word}» escondido. El resto parece calentamiento.`,
    (word) => `Casi se lee «${word}». El jurado no da puntos por intención.`,
    (word) => `La mitad de «${word}» está. La otra mitad, no.`,
    (word) => `Se puede apostar por «${word}», con dudas serias.`,
    (word) => `«${word}» asoma, flojo y sin los detalles que lo nombran.`,
    (word) => `Un «${word}» tímido. Se entiende a medias y con esfuerzo.`,
  ],
  6: [
    (word) => `«${word}» ya se reconoce, aunque el dibujo sigue corto.`,
    (word) => `Se ve «${word}», con rasgos flojos y poca seguridad.`,
    (word) => `El objeto es «${word}». Falta carácter y un par de detalles.`,
    (word) => `Pasable: «${word}» se entiende, sin lucirse.`,
    (word) => `«${word}» está, en versión rápida y algo torpe.`,
    (word) => `Se nombra «${word}» a la primera duda, no a la primera mirada.`,
    (word) => `Hay «${word}», sí. Todavía le sobra timidez al trazo.`,
  ],
  7: [
    (word) => `«${word}» se entiende, aunque llegó con prisa y a medias.`,
    (word) => `«${word}» es reconocible, flojo de rasgos y de detalle.`,
    (word) => `Vale, se ve «${word}». Nadie aplaudiría todavía.`,
    (word) => `Buen camino: «${word}» está claro a medias y con huecos.`,
    (word) => `«${word}» funciona. Le falta el detalle que lo vuelve obvio.`,
    (word) => `Se adivina «${word}» sin drama, y también sin brillo.`,
    (word) => `Correcto y discreto. «${word}» cumple, no destaca.`,
  ],
  8: [
    (word) => `«${word}» se ve bien. Reservado el aplauso, no el diploma.`,
    (word) => `«${word}» está claro: alguien lo adivinaría sin sufrir.`,
    (word) => `Buen «${word}». Los rasgos bastan y el conjunto cierra.`,
    (word) => `Se lee «${word}» de un vistazo. Aún cabe afinar un borde.`,
    (word) => `El «${word}» convence. El jurado asiente, sin ponerse de pie.`,
    (word) => `Claro y limpio. «${word}» ya no pide explicación.`,
    (word) => `Ocho merecido: «${word}» se reconoce con facilidad.`,
  ],
  9: [
    (word) => `«${word}» se adivina al instante. Casi no hay duda.`,
    (word) => `Muy claro el «${word}». Los detalles hacen el trabajo.`,
    (word) => `Cualquiera diría «${word}» antes de pestañear.`,
    (word) => `El «${word}» está sólido. Forma, rasgo y silueta coinciden.`,
    (word) => `Casi sobresaliente. «${word}» se explica solo.`,
    (word) => `Nítido de verdad. «${word}» no necesita pie de foto.`,
    (word) => `El jurado lo nombra de inmediato: «${word}».`,
  ],
  10: [
    (word) => `«${word}» se adivina al instante. No te acostumbres.`,
    (word) => `Está claro «${word}». El jurado, a regañadientes, lo concede.`,
    (word) => `Diez justo: «${word}» es obvio para quien lo mire.`,
    (word) => `Sin duda es «${word}». El boceto no deja resquicio.`,
    (word) => `Perfectamente legible. «${word}» gana la ronda.`,
    (word) => `El «${word}» está cerrado. Nada sobra y nada falta.`,
    (word) => `Nota alta y merecida. «${word}» se entiende de un vistazo.`,
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
