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
    (word) => `Hoy es un gran día para empezar. Bosqueja «${word}» con una forma grande.`,
    (word) => `Respira y prueba de nuevo. «${word}» sale mejor con una silueta clara.`,
    (word) => `El primer trazo ya es victoria. Ahora busca la forma de «${word}».`,
    (word) => `¡Tú puedes! Empieza por el contorno más fácil de «${word}».`,
    (word) => `No hay prisa. Dibuja «${word}» paso a paso y con gusto.`,
    (word) => `Buen impulso creativo. Dale a «${word}» su primera forma reconocible.`,
    (word) => `Estás aprendiendo. Un intento más y «${word}» se asomará.`,
    (word) => `¡Vamos! Piensa en «${word}» y marca dos o tres líneas principales.`,
    (word) => `Cada boceto enseña algo. Intenta otra vez con «${word}».`,
    (word) => `Ánimo total. El papel está listo para tu mejor «${word}».`,
    (word) => `Empieza simple: un óvalo, una línea… y «${word}» irá naciendo.`,
    (word) => `Se valora el intento. Ahora suma la silueta de «${word}».`,
    (word) => `¡Sigue dibujando! «${word}» aparece cuando te atreves otra vez.`,
    (word) => `Buen espíritu. Convierte esas líneas en un «${word}» claro.`,
  ],
  2: [
    (word) => `Hay movimiento, ¡bien! Ahora busca que se note más «${word}».`,
    (word) => `Vas avanzando. Añade un rasgo típico de «${word}» y se entenderá mejor.`,
    (word) => `Buen esfuerzo. Con un poco más de forma, «${word}» se asomará.`,
    (word) => `Se nota que lo intentaste. Prueba la silueta básica de «${word}».`,
    (word) => `¡Ánimo! Estás cerca de empezar: un detalle más y «${word}» cobra vida.`,
    (word) => `Sigue practicando. «${word}» necesita una forma un poquito más clara.`,
    (word) => `Vas bien por intentarlo. Dale un segundo boceto a «${word}».`,
    (word) => `Ya hay energía en el trazo. Guía esas líneas hacia «${word}».`,
    (word) => `Buen avance. Marca el tamaño general de «${word}» y verás el cambio.`,
    (word) => `Se siente el intento. Un contorno más firme y «${word}» aparece.`,
    (word) => `¡Sigue! Estás calentando: ahora apunta claro a «${word}».`,
    (word) => `Hay base. Añade el rasgo más famoso de «${word}».`,
    (word) => `Vas mejorando. Simplifica y dibuja «${word}» con pocas líneas fuertes.`,
    (word) => `Ánimo creativo. «${word}» pide una forma un poco más grande y clara.`,
    (word) => `Buen ritmo. Cierra la silueta de «${word}» y se entenderá.`,
    (word) => `Estás en marcha. Un detalle clave de «${word}» cambia todo.`,
    (word) => `Se ve curiosidad en el dibujo. Dirígela hacia «${word}».`,
    (word) => `¡Tú puedes! Reescribe «${word}» con su forma más sencilla.`,
    (word) => `Hay progreso. Dale a «${word}» un centro claro en el lienzo.`,
    (word) => `Buen segundo paso. Completa lo esencial de «${word}».`,
    (word) => `No pares: con un trazo más seguro, «${word}» se deja ver.`,
  ],
  3: [
    (word) => `¡Buen intento! «${word}» aún se esconde, pero el trazo ya tiene energía.`,
    (word) => `Vas por buen camino. Marca mejor la forma principal de «${word}».`,
    (word) => `Se ve esfuerzo. Un rasgo clave más y «${word}» se reconocerá.`,
    (word) => `Ánimo: ya hay líneas. Ayuda a «${word}» con su silueta más simple.`,
    (word) => `Casi arranca. Piensa en lo más fácil de dibujar de «${word}».`,
    (word) => `¡Sigue así! Con un poco más de claridad, «${word}» se entiende.`,
    (word) => `Buen comienzo creativo. Dale una forma más definida a «${word}».`,
    (word) => `Hay potencial. Ordena un poco las líneas y «${word}» se lee mejor.`,
    (word) => `Vas creciendo. Añade el detalle más típico de «${word}».`,
    (word) => `Se nota práctica. Refuerza el contorno de «${word}» y ganas.`,
    (word) => `¡Qué bien que sigues! «${word}» necesita solo un poco más de forma.`,
    (word) => `Buen impulso. Haz «${word}» un poco más grande y claro.`,
    (word) => `Estás cerca del salto. Un rasgo fuerte y «${word}» aparece.`,
    (word) => `Hay idea. Tradúcela en la silueta simple de «${word}».`,
    (word) => `Ánimo constante. «${word}» se entiende mejor con menos prisa.`,
    (word) => `Buen boceto en proceso. Completa lo básico de «${word}».`,
    (word) => `Se ve ganas. Marca dos partes claras de «${word}» y listo.`,
    (word) => `¡Vas! Un ajuste pequeño y «${word}» se reconoce más.`,
    (word) => `Hay progreso real. Dale identidad a «${word}» con un detalle.`,
    (word) => `Sigue con confianza. «${word}» está a un trazo de verse.`,
    (word) => `Buen espíritu de juego. Redibuja «${word}» un poco más limpio.`,
  ],
  4: [
    (word) => `¡Se asoma! «${word}» pide un poquito más de forma para brillar.`,
    (word) => `Vas muy bien. Un detalle típico y «${word}» se verá más claro.`,
    (word) => `Hay una pista linda de «${word}». Sigue: ya casi se lee.`,
    (word) => `Buen progreso. Completa un rasgo más de «${word}» y listo.`,
    (word) => `Se siente la idea de «${word}». Ánimo: estás cerca.`,
    (word) => `¡Sigue! Con un poco más de definición, «${word}» se entiende mejor.`,
    (word) => `Buen boceto inicial. Dale cuerpo a «${word}» con calma.`,
    (word) => `Ya hay pista. Refuerza la silueta de «${word}» y ganas claridad.`,
    (word) => `Vas cerca. Un toque más y «${word}» se lee sin esfuerzo.`,
    (word) => `Se nota avance. Añade el rasgo estrella de «${word}».`,
    (word) => `¡Qué bien! «${word}» empieza a hablar; completa un detalle.`,
    (word) => `Buen camino. Haz un poco más evidente la forma de «${word}».`,
    (word) => `Estás a un paso. Cierra mejor el contorno de «${word}».`,
    (word) => `Hay reconocimiento tímido. Dale seguridad al trazo de «${word}».`,
    (word) => `Ánimo: se ve intención. «${word}» quiere un detalle más.`,
    (word) => `Buen trabajo en progreso. Aclara una parte de «${word}».`,
    (word) => `Se asoma con ternura. Ayuda a «${word}» con una línea firme.`,
    (word) => `¡Vas genial en el intento! Un rasgo más y «${word}» brilla.`,
    (word) => `Hay base sólida. Completa lo que falta de «${word}».`,
    (word) => `Sigue así. «${word}» ya tiene dirección; solo pide claridad.`,
    (word) => `Buen esfuerzo creativo. Redondea la idea de «${word}».`,
  ],
  5: [
    (word) => `¡Ya se intuye «${word}»! Un par de detalles y quedará más claro.`,
    (word) => `Vas a mitad de camino. «${word}» está ahí: dale un empujoncito más.`,
    (word) => `Buen trabajo. Se lee «${word}» a medias; un rasgo más ayuda mucho.`,
    (word) => `Se nota el esfuerzo. «${word}» casi se reconoce: ¡sigue!`,
    (word) => `¡Ánimo! Con un detalle clave, «${word}» se entiende del todo.`,
    (word) => `Vas bien. Aclara un poquito la forma de «${word}» y ganas.`,
    (word) => `Hay progreso real. «${word}» asoma: completa lo que falta.`,
    (word) => `Se entiende la idea. Un toque más y «${word}» queda claro.`,
    (word) => `¡Bien! «${word}» ya no está tan escondido. Suma un detalle.`,
    (word) => `Buen equilibrio. Afina un borde de «${word}» y mejora mucho.`,
    (word) => `Vas con ritmo. «${word}» pide solo un poco más de definición.`,
    (word) => `Se ve tu práctica. Completa el rasgo típico de «${word}».`,
    (word) => `Ánimo alto. Estás a un detalle de un «${word}» muy claro.`,
    (word) => `Buen boceto. Haz más evidente la parte principal de «${word}».`,
    (word) => `¡Sigue! «${word}» se lee si cierras mejor su silueta.`,
    (word) => `Hay claridad a medias. Un trazo seguro eleva a «${word}».`,
    (word) => `Vas creciendo dibujo a dibujo. Remata «${word}» con cariño.`,
    (word) => `Se nota intención linda. Dale el último empujón a «${word}».`,
    (word) => `Buen punto medio. «${word}» ya existe; solo falta afilarlo.`,
    (word) => `¡Qué avance! Un detalle más y «${word}» se reconoce fácil.`,
    (word) => `Estás muy cerca. Confía y marca mejor «${word}».`,
  ],
  6: [
    (word) => `¡Se reconoce «${word}»! Buen trabajo. Un detalle más lo haría brillar.`,
    (word) => `Muy bien: ya se entiende «${word}». Puedes afinar un borde si quieres.`,
    (word) => `Buen dibujo. «${word}» se ve; sigue sumando confianza al trazo.`,
    (word) => `¡Vas genial! «${word}» está claro a medias: un toque más y queda redondo.`,
    (word) => `Se nota tu avance. «${word}» funciona; ¡ánimo para el siguiente!`,
    (word) => `Buen resultado. Quien mire puede ver «${word}». Sigue así.`,
    (word) => `¡Bien hecho! «${word}» ya tiene presencia. Un detalle extra lo eleva.`,
    (word) => `Se lee «${word}» con gusto. Estás dibujando con más seguridad.`,
    (word) => `¡Bravo por el progreso! «${word}» se entiende; puedes pulir un poco.`,
    (word) => `Buen ojo. «${word}» ya comunica. Un rasgo fino lo hace aún mejor.`,
    (word) => `Vas sólido. Se reconoce «${word}»; sigue confiando en tu trazo.`,
    (word) => `Hay claridad. «${word}» está presente y el esfuerzo se nota.`,
    (word) => `¡Qué bien! Un pequeño retoque y «${word}» queda todavía más limpio.`,
    (word) => `Buen nivel. «${word}» se adivina; sigue practicando con alegría.`,
    (word) => `Se ve dominio creciente. «${word}» funciona muy bien así.`,
    (word) => `Ánimo y felicitaciones. «${word}» ya tiene forma reconocible.`,
    (word) => `Estás en buena racha. «${word}» se entiende sin mucho esfuerzo.`,
    (word) => `Buen equilibrio de líneas. «${word}» se nota; ¡sigue creando!`,
    (word) => `Hay logro. Quien mire puede apuntar a «${word}» sin dudar mucho.`,
    (word) => `¡Sigue así! «${word}» ya tiene carácter. Un detalle lo corona.`,
    (word) => `Muy buen paso. «${word}» se reconoce y motiva a dibujar otra vez.`,
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
