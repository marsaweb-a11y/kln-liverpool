# KLN · Inspección Liverpool (PWA)

App instalable (iPhone/Android) para que los supervisores inspeccionen áreas de
Liverpool, suban fotos y generen un reporte en Google Slides para el jefe.

- **Frontend:** HTML + CSS + JS estático (este folder). PWA instalable.
- **Backend:** Google Apps Script (`Code.gs`) → guarda fotos en Drive, escribe en
  Google Sheets y genera el reporte en Slides.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html`, `style.css`, `app.js` | La app (frontend). |
| `config.js` | **Lo único que editas en el frontend.** |
| `manifest.json`, `service-worker.js`, `icons/` | Para instalar como app. |
| `Code.gs` | El backend de Google Apps Script. |

---

## PASO 1 · Backend (Google Apps Script)

1. Crea (o abre) un **Google Sheet**. En la URL copia su **ID**
   (`.../d/`**`ESTO_ES_EL_ID`**`/edit`).
2. En **Google Drive** crea 2 carpetas: una para **fotos** y otra para **reportes**.
   Abre cada una y copia su **ID** desde la URL (`.../folders/`**`ID`**).
3. Ve a [script.google.com](https://script.google.com) → **Nuevo proyecto**.
4. Borra todo y pega el contenido de `Code.gs`.
5. Arriba, en el bloque `CONFIG`, pega los 3 IDs:
   - `SHEET_ID`
   - `FOTOS_FOLDER_ID`
   - `REPORTES_FOLDER_ID`
6. Ejecuta una vez la función `_test_setup` (botón ▶). Acepta los permisos.
   Esto crea la pestaña **"Inspecciones"** con encabezados.
7. **Implementar → Nueva implementación → tipo: App web**:
   - *Descripción:* KLN Liverpool
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier persona**
8. Copia la **URL del Web App** (termina en `/exec`).

> Cada vez que cambies `Code.gs`, vuelve a **Implementar → Editar implementación →
> Nueva versión**, o usa "Administrar implementaciones".

---

## PASO 2 · Conectar el frontend

Abre `config.js` y pega la URL del Web App:

```js
ENDPOINT_URL: "https://script.google.com/macros/s/XXXX/exec",
```

Mientras la URL diga `PEGAR_AQUI…`, la app **funciona** pero guarda los envíos en
una **cola local** en el teléfono y los manda solos cuando la configures.

(Opcional) En `config.js` puedes ajustar la calidad/peso de las fotos y el contrato.

---

## PASO 3 · Subir a GitHub Pages

1. Crea un repo en GitHub (p. ej. `kln-liverpool`).
2. Sube **todo el contenido de este folder** (que `index.html` quede en la raíz del repo).
   ```bash
   git init
   git add .
   git commit -m "App KLN Liverpool"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/kln-liverpool.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment**
   - *Source:* **Deploy from a branch**
   - *Branch:* **main** / carpeta **/(root)** → **Save**.
4. Espera ~1 min. Tu URL será:
   `https://TU_USUARIO.github.io/kln-liverpool/`

---

## PASO 4 · Instalar en el iPhone

1. Abre la URL en **Safari**.
2. Toca **Compartir** (cuadro con flecha) → **Agregar a pantalla de inicio**.
3. Ábrela desde el ícono: se ve como app nativa (sin barra del navegador).

> Tras cambios en la app, sube la versión del cache en `service-worker.js`
> (`kln-liverpool-v1` → `v2`…) para que los iPhone ya instalados se actualicen.

---

## Cómo se usa (supervisor)

1. **Nivel** → Planta Baja / Piso 1 / Piso 2.
2. **Área** → el menú depende del nivel (Deportes, Bolsas, Perfumería, Baños…).
3. **Sub-área** → escribe para buscar y toca el departamento.
4. **Supervisor** → escribe tu nombre (se recuerda en el dispositivo).
5. **Calificación** → Excelente / Buena / Regular / Mala.
6. **Observación** (opcional) y **1–3 fotos**.
7. **Guardar y siguiente área** (conserva nivel, área y supervisor; limpia sub-área).
8. Al final: **Terminar y enviar reporte al jefe** → genera el Slides del día.

> Estructura: **Nivel → Área → Sub-área**. Se edita en `config.js`
> (`AREAS_LIVERPOOL`). Si un área tiene la lista de sub-áreas **vacía `[]`**
> (como casi todas las de Piso 2), la app **omite** el campo Sub-área y se
> inspecciona el área directo.

---

## Notas técnicas

- Las fotos se **comprimen en el teléfono** antes de enviarse (config en `config.js`).
- El envío usa `Content-Type: text/plain` para evitar el *preflight* CORS contra
  Apps Script (es el patrón recomendado).
- **Offline:** puedes llenar y guardar sin internet; los envíos quedan en cola y se
  mandan al recuperar señal. El **reporte** sí requiere conexión.
- **Estado** = OK si Excelente/Buena; Observación si Regular/Mala.
- Columnas del Sheet: `Fecha · Hora · Contrato · Nivel · Area · SubArea · Supervisor
  · Calificacion · Estado · Observacion · Link foto`.
- Si hay varias fotos van como links separados por coma en *Link foto*.

---

## Seguridad

La app es estática y pública (GitHub Pages) y el backend es un Web App de Apps
Script con acceso "Cualquiera" (necesario para usarla sin login de Google). Eso
implica que **la URL del endpoint y el token son públicos**. Sabiendo eso, el código
está endurecido para que el daño posible esté muy acotado. Resumen de defensas:

- **Todo va por HTTPS** (GitHub Pages y `script.google.com`).
- **Fotos privadas:** las imágenes se guardan en Drive **sin compartir**. El reporte
  las inserta desde el servidor (como dueño), así que no se exponen públicamente.
  Solo se aceptan tipos de imagen reales (JPG/PNG/WEBP).
- **Anti-DoS:** el backend rechaza solicitudes > 12 MB o con más de 3 fotos **antes**
  de procesarlas, y descarta fotos > 6 MB.
- **Anti-inyección de fórmulas (Sheets):** todo texto del usuario se neutraliza antes
  de escribirse en la hoja (un valor que empieza con `= + - @` se guarda como texto).
- **Validación estricta:** campos obligatorios, calificación dentro de las 4 válidas,
  y textos recortados a 500 caracteres.
- **Límite de uso:** candado + tope de 60 solicitudes por minuto para que nadie agote
  la cuota de Google a base de llamadas.
- **Errores genéricos:** el servidor no devuelve detalles internos (quedan en los logs
  de Apps Script); evita filtrar IDs o estructura.
- **Token anti-abuso:** cadena larga y aleatoria, igual en `config.js` y `Code.gs`.
  > El token viaja en el JS público, así que **disuade**, no es auth fuerte. La defensa
  > real son los límites y la validación de arriba, no el token. Para auth fuerte
  > habría que usar inicio de sesión de Google (más fricción para el supervisor).
- **Datos personales:** solo se captura el **nombre del supervisor**. Sin contraseñas
  ni datos sensibles.

### Si algún día quieres rotar el token
Cámbialo en `config.js` **y** en `Code.gs` (debe ser idéntico), vuelve a subir
`config.js` a GitHub y **re-publica** el Apps Script (Editar implementación → Nueva
versión).

---

## Reemplazar los iconos (opcional)

En `icons/` están los 3 PNG generados desde el logo KLN (`logo.jpg`):
`icon-192.png`, `icon-512.png` y `icon-512-maskable.png`. Si cambias el logo,
reemplaza esos 3 archivos con los mismos nombres y tamaños (192, 512, 512).
