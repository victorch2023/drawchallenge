# Draw Challenge

Juego de dibujo personal: intentas representar una palabra clave y **Gemini** evalúa qué tan bien lo lograste (puntuación del 1 al 10).

El frontend vive en **GitHub Pages**. Las llamadas a Gemini pueden ir **directas desde el navegador** o a través de un **proxy Vercel** opcional que expone la cuota real de Google.

## Funciones

- Lienzo **a pantalla completa** (ratón o tacto)
- Modo **Gemini elige**: propone palabras dibujables (estilo Pictionary / juegos de mesa)
- Modo **Mi lista**: palabras del panel de control
- Botón **Entregar** → Gemini puntúa del 1 al 10
- **Panel de control** (`admin.html`) para API key, proxy y lista personal
- **Contador de cuota** (opción A: local honesto + opción B: cuota Google vía proxy)

## Despliegue en GitHub Pages

### Paso 1 — Esperar el workflow verde

Cada push a `main` ejecuta **Publicar GitHub Pages** (Actions). Cuando termine en verde, el sitio estará en la rama `gh-pages`.

### Paso 2 — Configurar Pages (una sola vez)

1. Abre **[Settings → Pages](https://github.com/victorch2023/drawchallenge/settings/pages)**
2. **Source:** **Deploy from a branch**
3. **Branch:** **`gh-pages`** · carpeta **`/ (root)`**
4. Pulsa **Save**

Tu app quedará en:

**https://victorch2023.github.io/drawchallenge/**

Cada `git push` a `main` actualiza el sitio automáticamente.

## Probar en local

```bash
npm start
# Abre http://localhost:8080
```

---

## Cuota de Gemini: opción A y opción B

Google limita las llamadas por minuto (RPM) y por día (RPD). El navegador **no puede leer** los headers de cuota de Google por CORS si llamas directo a la API.

### Opción A — Contador local (siempre activo)

Sin configurar nada extra, la app cuenta:

- **Llamadas hoy** en Draw Challenge (reinicio a medianoche, hora del Pacífico)
- **Ritmo por minuto** local según el modelo elegido
- **Estimado diario** basado en los límites orientativos del tier gratuito

El badge en `index.html` muestra algo como `23 hoy · 2/15 min`. En el panel de control verás el desglose completo.

> Este contador mide **solo esta app en este navegador**. Si conoces tu cuota real en AI Studio, puedes ajustar el campo «Límite local est.» en el panel.

### Opción B — Proxy Vercel (cuota real de Google)

Una función serverless en Vercel llama a Gemini por ti y devuelve los headers `x-ratelimit-*` de Google. La app muestra entonces algo como `Google: 47/50 · 23 aquí`.

#### 1. Desplegar el proxy en Vercel

1. Crea cuenta en [vercel.com](https://vercel.com) e importa el repo `victorch2023/drawchallenge`
2. En **Settings → Environment Variables**, añade:

| Variable | Valor |
|----------|--------|
| `ALLOWED_ORIGINS` | `https://victorch2023.github.io,http://localhost:8080,http://localhost:3000` |
| `GEMINI_API_KEY` | *(opcional)* Si la dejas vacía, la app envía la key desde el panel |

3. Pulsa **Deploy**. La URL del proxy será algo como:

`https://tu-proyecto.vercel.app/api/gemini`

#### 2. Configurar en Draw Challenge

1. Abre **`admin.html`**
2. En **Proxy Vercel**, pega la URL anterior (sin barra final)
3. Pulsa **Guardar**

Si el proxy falla por un error no relacionado con cuota, la app vuelve automáticamente a la llamada directa.

---

## Guía: crear una API key gratuita de Gemini

### 1. Entra en Google AI Studio

Abre: **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**

### 2. Genera la API key

1. Pulsa **Create API key**
2. Elige un proyecto (por ejemplo `drawchallenge`)
3. Copia la clave (`AIza…` o `AQ.…`)

### 3. Configúrala en Draw Challenge

1. Abre **`admin.html`**
2. Pega la API key y elige **`gemini-2.5-flash`**
3. *(Opcional)* Pega la URL del proxy Vercel
4. Pulsa **Guardar**

### 4. Prueba

1. Ve a **`index.html`**
2. Dibuja la palabra que aparece
3. Pulsa **Entregar dibujo**

---

## Plan gratuito de Gemini (uso personal)

| Concepto | Detalle |
|----------|---------|
| **Costo** | $0 en el tier gratuito |
| **Modelo recomendado** | `gemini-2.5-flash` |
| **Cuota** | Limitada por día y por minuto |
| **Tarjeta** | No obligatoria para empezar en AI Studio |

Si ves *«Cuota agotada»* o *«Límite por minuto»*, espera unos segundos o al día siguiente.

---

## Privacidad y seguridad

- La API key vive en **localStorage** de tu navegador; no va al repo de GitHub.
- Con proxy: la key viaja cifrada (HTTPS) al servidor Vercel y de ahí a Google. Puedes omitir `GEMINI_API_KEY` en Vercel y enviarla solo desde el navegador.
- Cada dibujo se envía a Google al pulsar Entregar.

---

## Estructura

```
index.html      → Dibujar y evaluar
admin.html      → Palabras clave + Gemini + proxy
js/             → Lógica del cliente
api/gemini.js   → Proxy Vercel (opción B)
css/            → Estilos
vercel.json     → Configuración Vercel
```

## Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| «Configura tu API key…» | Ve a `admin.html` y guarda la key |
| «API key rechazada» | Crea una key nueva en AI Studio |
| «Límite por minuto» | Espera 30–60 s y reintenta |
| «Cuota diaria agotada» | Espera al reinicio (medianoche Pacífico) o revisa AI Studio |
| Badge muestra muchos restantes pero Google bloquea | Activa el proxy Vercel (opción B) para ver la cuota real |
| Proxy no devuelve cuota Google | Normal en algunas respuestas; el contador local sigue activo |
