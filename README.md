# Draw Challenge

Juego de dibujo: representas una palabra y un **modelo abierto** puntúa el boceto del 1 al 10.

La evaluación ocurre **en el navegador**. La primera vez se descarga **SmolVLM 256M** (~200 MB) y queda guardado en el dispositivo. No hace falta API key, Gemini ni un servidor de IA.

## Funciones

- Lienzo a pantalla completa (ratón o tacto)
- Modo **Al azar**: elige una palabra dibujable de una lista, sin repetir las recientes
- Modo **Mi lista**: palabras del panel de control
- Botón **Entregar**: el modelo pone la nota del 1 al 10 y la app escribe el comentario

## Despliegue

El sitio estático se publica en GitHub Pages:

**https://victorch2023.github.io/drawchallenge/**

Cada push a `main` ejecuta el workflow que actualiza la rama `gh-pages`.

## Probar en local

```bash
npm start
# Abre http://localhost:8080
```

La primera partida descarga el modelo desde Hugging Face. Las siguientes usan la caché del navegador.

## Privacidad

El dibujo no se envía a un servicio de IA. Se procesa en tu GPU o CPU. Solo la descarga inicial de los pesos del modelo sale a internet.

## Estructura

```
index.html              → Dibujar y evaluar
admin.html              → Palabras y caché del modelo
js/localModel.js        → Descarga y caché en el navegador
js/localModel.worker.js → SmolVLM (WebGPU o CPU)
```
