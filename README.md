# Draw Challenge

Juego de dibujo personal: intentas representar una palabra clave y **Gemini** evalúa qué tan bien lo lograste (puntuación del 1 al 10).

Funciona **100 % en GitHub Pages**, sin Vercel ni backend. La API key de Gemini se guarda en tu navegador (como en registro financiero).

## Funciones

- Lienzo **a pantalla completa** (ratón o tacto)
- Modo **Gemini elige**: propone palabras dibujables (estilo Pictionary / juegos de mesa)
- Modo **Mi lista**: palabras del panel de control
- Botón **Entregar** → Gemini puntúa del 1 al 10
- **Panel de control** (`admin.html`) para API key y lista personal

## Despliegue en GitHub Pages

### Paso 1 — Esperar el workflow verde

Cada push a `main` ejecuta **Publicar GitHub Pages** (Actions). Cuando termine en verde, el sitio estará en la rama `gh-pages`.

### Paso 2 — Configurar Pages (una sola vez)

1. Abre **[Settings → Pages](https://github.com/victorch2023/drawchallenge/settings/pages)**
2. **Source:** **Deploy from a branch**
3. **Branch:** **`gh-pages`** · carpeta **`/ (root)`**
4. Pulsa **Save** (solo estará activo si cambiaste de `main` a `gh-pages`)

Tu app quedará en:

**https://victorch2023.github.io/drawchallenge/**

> El deployment en rojo *「Deploy GitHub Pages #1」* es del workflow antiguo (ya eliminado). Ignóralo.

Cada `git push` a `main` actualiza el sitio automáticamente.

## Probar en local

```bash
npm start
# Abre http://localhost:8080
```

---

## Guía: crear una API key gratuita de Gemini

Sigue estos pasos **una sola vez** (tarda ~2 minutos):

### 1. Entra en Google AI Studio

Abre: **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**

Inicia sesión con tu cuenta de Google.

### 2. Crea un proyecto (si te lo pide)

Google puede pedirte un nombre de proyecto. Cualquier nombre vale, por ejemplo `drawchallenge-personal`.

### 3. Genera la API key

1. Pulsa **「Create API key」** / **「Crear clave de API」**
2. Elige **Create key in new project** (proyecto nuevo) o un proyecto existente
3. Copia la clave. Empieza por **`AIza…`** o **`AQ.…`**

> Guarda la clave en un gestor de contraseñas. Google no siempre la vuelve a mostrar completa.

### 4. Configúrala en Draw Challenge

1. Abre **`admin.html`** en tu app (local o GitHub Pages)
2. En la sección **Gemini**, pega la API key
3. Deja el modelo **`gemini-2.5-flash`** (recomendado, gratis con cuota diaria)
4. Pulsa **Guardar key**

Deberías ver: *「Configurada: AIza…xxxx」*

### 5. Prueba

1. Ve a **`index.html`**
2. Dibuja la palabra que aparece (por ejemplo «árbol»)
3. Pulsa **Entregar dibujo**
4. Gemini devuelve una puntuación del 1 al 10 y una breve explicación

---

## Plan gratuito de Gemini (uso personal)

| Concepto | Detalle |
|----------|---------|
| **Costo** | $0 en el tier gratuito |
| **Modelo recomendado** | `gemini-2.5-flash` (visión + texto) |
| **Cuota** | Limitada por día (suficiente para uso personal) |
| **Tarjeta** | No obligatoria para empezar en AI Studio |
| **Misma key en otra app** | Sí, pero compartís cuota y riesgo si se filtra |

Si ves *「Cuota agotada」*, espera unos minutos o al día siguiente.

---

## Privacidad y seguridad

- La API key vive en **localStorage** de tu navegador; no va al repo de GitHub.
- Cada dibujo se envía **directamente a Google** al pulsar Entregar.
- Es una app **personal**: no compartas la URL con la key ya configurada en un dispositivo compartido.

---

## Estructura

```
index.html    → Dibujar y evaluar
admin.html    → Palabras clave + API key
js/           → Lógica (Gemini directo desde el navegador)
css/          → Estilos
```

## Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| «Configura tu API key…» | Ve a `admin.html` y guarda la key |
| «API key rechazada» | Crea una key nueva en AI Studio y vuelve a guardarla |
| «Cuota agotada» | Espera o usa otro modelo Flash en el panel |
| Palabra no cambia | Configúrala en `admin.html` o pulsa «Otra palabra» |
