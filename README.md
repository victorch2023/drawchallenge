# Draw Challenge

Juego de dibujo: representas una palabra y un **modelo abierto** puntúa el boceto del 1 al 10.

La evaluación ocurre **en el navegador**. La primera vez se descarga **SmolVLM 256M** (~200 MB) y queda guardado en el dispositivo. No hace falta API key de Gemini.

## Funciones

- Lienzo a pantalla completa (ratón o tacto)
- Modo **Al azar**: sortea una palabra entre más de 700 objetos y animales dibujables
- Modo **Mi lista**: palabras del panel de control
- Botón **Entregar**: el modelo pone la nota y la app elige una de siete frases para ese número
- **Estadísticas** (`stats.html`): envíos anónimos (usuario1, usuario2…), nota, palabra, fecha

## Despliegue del juego (GitHub Pages)

**https://victorch2023.github.io/drawchallenge/**

Cada push a `main` actualiza la rama `gh-pages`.

## Registro anónimo (Vercel + Blob, plan Hobby)

Cada Entregar manda a Vercel solo: un ID anónimo del navegador, la palabra, la nota y la hora. **No se envía el dibujo.**

### 1. Crear Blob en Vercel

1. Abre el proyecto **drawchallenge** en [vercel.com](https://vercel.com)
2. **Storage → Create → Blob**
3. Copia el token `BLOB_READ_WRITE_TOKEN`

### 2. Variables de entorno

En **Settings → Environment Variables**:

| Variable | Valor |
|----------|--------|
| `BLOB_READ_WRITE_TOKEN` | el token del Blob |
| `ADMIN_TOKEN` | una contraseña larga que solo tú conozcas |
| `ALLOWED_ORIGINS` | `https://victorch2023.github.io,http://localhost:8080,http://127.0.0.1:8080` |

### 3. Redeploy

En **Deployments**, vuelve a desplegar el último commit (o espera al deploy automático tras el push).

### 4. Ver el panel

Abre **https://victorch2023.github.io/drawchallenge/stats.html**, pega el `ADMIN_TOKEN` y pulsa **Cargar**.

## Probar en local

```bash
npm start
# Abre http://localhost:8080
```

## Privacidad

- El dibujo se evalúa en el dispositivo; no va a Vercel.
- El registro guarda un código anónimo en `localStorage` (no nombre ni email). Borrar datos del sitio crea un usuario nuevo.
- El panel de estadísticas requiere `ADMIN_TOKEN`.

## Estructura

```
index.html / admin.html / stats.html
js/analytics.js         → Envío anónimo al entregar
api/submit.js           → Guarda el envío en Vercel Blob
api/stats.js            → Lista protegida con ADMIN_TOKEN
```
