# Audio M4A para iPhone

Web app que extrae el audio de un archivo **MP4** directamente en Safari de iPhone, le pone **título, artista, álbum, año, género y portada**, y lo entrega como **.m4a** mediante la hoja de compartir de iOS. Todo se procesa en el dispositivo con [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm); la canción nunca se sube a un servidor.

> **Aviso honesto:** esta app **no añade la canción a la app Música de Apple**. Con solo un iPhone y sin computadora, eso no es posible por ninguna vía oficial (ver abajo).

---

## 1. Conclusión técnica

**Veredicto: NO VIABLE con las restricciones planteadas** (solo iPhone, sin computadora, sin suscripción). **Viable parcialmente** como alternativa: convertir y etiquetar en el iPhone, y completar el último paso con una computadora una sola vez.

| Ruta | ¿Qué hace realmente? | ¿Sirve para archivos propios desde el iPhone? |
|---|---|---|
| Apple Music API | Consulta el catálogo y la biblioteca de un suscriptor; añade elementos **del catálogo** | No. No tiene endpoint para subir audio propio y requiere suscripción para la biblioteca |
| MusicKit (JS / Swift) | Reproducción y gestión de contenido del catálogo y la biblioteca autorizada | No. Igual que la API |
| Safari / Web APIs | Leer archivos elegidos por el usuario, procesarlos, compartirlos o descargarlos | No. Ninguna API web escribe en la biblioteca de Música |
| Hoja de compartir de iOS | Envía el archivo a apps que lo acepten (Archivos, Mensajes, etc.) | No. Música no es destino para archivos de audio |
| Sincronización por cable o Wi-Fi | Copia la biblioteca desde la app Música (Mac) o Dispositivos Apple / iTunes (Windows) al iPhone | **Sí**, pero requiere computadora |
| Sincronizar biblioteca (iCloud) | Con Apple Music o iTunes Match, sube la biblioteca de la computadora a iCloud | **Sí**, pero requiere suscripción **y** añadir el archivo primero en la app Música de una computadora |

**La restricción concreta:** iOS solo permite que entren archivos de audio personales a la biblioteca de Música a través de la app Música/iTunes de una computadora. No existe API pública (web ni nativa) que lo haga desde el propio iPhone.

**Requisito mínimo que tendría que cambiar:** tener acceso **una vez** a una computadora (propia o prestada) con la app Música (Mac) o Dispositivos Apple / iTunes (Windows). Se añade el `.m4a` que genera esta app y se sincroniza el iPhone. **No se necesita suscripción.**

### Fuentes
- Apple Music API — https://developer.apple.com/documentation/applemusicapi
- MusicKit — https://developer.apple.com/documentation/musickit
- Sincronizar el iPhone con la computadora — https://support.apple.com/108311
- Sincronizar con el Finder en Mac — https://support.apple.com/102471
- Usar Sincronizar biblioteca con Apple Music — https://support.apple.com/HT204925
- Apple Support Community, «Can I add my own music to Apple Music on iPhone?» — https://discussions.apple.com/thread/256039134

---

## 2. Qué hace la app

- Selector de archivos compatible con iPhone (Archivos, iCloud Drive, Fotos).
- Detección del formato: contenedor (leyendo la cabecera `ftyp`), códec de audio y duración.
- Extracción del audio del MP4:
  - Si ya es AAC/ALAC → **copia sin pérdida** (segundos).
  - Si es otro códec → conversión a **AAC 256 kbps**.
- Etiquetas: título, artista, álbum, año, género.
- Portada incrustada (se recorta a cuadrado y se normaliza a JPEG ≤ 1000 px).
- Barra de progreso y mensajes de error claros (sin audio, memoria agotada, sin conexión…).
- Vista previa con reproductor.
- **Compartir / Guardar en Archivos** con la hoja de compartir nativa, o descarga directa.
- Modo claro y oscuro, diseño adaptado a Safari (sin zoom en campos, áreas seguras).

## 3. Dependencias externas

| Dependencia | Versión | Dónde | Para qué |
|---|---|---|---|
| `@ffmpeg/ffmpeg` | 0.12.10 | `vendor/ffmpeg.js`, `vendor/814.ffmpeg.js` | Envoltura JS y worker de ffmpeg.wasm (deben ser del mismo origen) |
| `@ffmpeg/util` | 0.12.1 | `vendor/ffmpeg-util.js` | `fetchFile` y `toBlobURL` |
| `@ffmpeg/core` | 0.12.6 | unpkg.com (se descarga la primera vez, ≈ 31 MB) | Motor FFmpeg compilado a WebAssembly, versión de un hilo |

Se usa el núcleo **de un solo hilo** porque no necesita `SharedArrayBuffer` ni las cabeceras COOP/COEP, que GitHub Pages no permite configurar. Todo es MIT/LGPL; ver las licencias de cada paquete.

## 4. Publicar en GitHub Pages

Publicada en **https://thoraal.github.io/** (repositorio `Thoraal/Thoraal.github.io`, rama `main`, carpeta raíz).

Para publicarla en otro repositorio:

1. Sube todos los archivos de esta carpeta, incluida `vendor/` y el archivo vacío `.nojekyll`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
3. En uno o dos minutos la app estará en `https://<tu-usuario>.github.io/<repositorio>/`.

Desde el iPhone sin computadora: en github.com (Safari, vista de escritorio) usa **Add file → Upload files** y elige los archivos desde Archivos.

Para abrirla como app: en Safari toca **Compartir → Añadir a pantalla de inicio**.

> No funciona abriendo `index.html` directamente desde Archivos: necesita servirse por HTTPS (GitHub Pages lo hace).

## 5. Uso en Safari

1. Abre la página y toca **Elige el archivo** → selecciona tu MP4.
2. Revisa o escribe título, artista y álbum; toca el cuadro para añadir portada (opcional).
3. Toca **Crear M4A** y espera (la primera vez descarga el motor).
4. Toca **Compartir / Guardar en Archivos** → **Guardar en Archivos**.
5. Escúchalo desde Archivos, o cuando tengas una computadora: arrastra el `.m4a` a la app Música / iTunes y sincroniza el iPhone.

## 6. Limitaciones que no se pueden eliminar

- **No añade la canción a la app Música.** Ninguna web ni app de terceros puede hacerlo en iOS.
- El último paso hacia Música exige una computadora (una vez) con la app Música o iTunes.
- La primera conversión necesita internet para descargar el motor (≈ 31 MB); después queda en la caché de Safari, que iOS puede borrar.
- Archivos muy grandes (> 250 MB aprox.) pueden agotar la memoria de Safari en iPhone.
- La conversión es más lenta que en una computadora (núcleo de un solo hilo).
- Archivos con DRM (por ejemplo, de servicios de streaming) no se pueden procesar.
- La hoja de compartir depende de la versión de iOS; si no aparece, se usa la descarga directa.

## Licencia

MIT. Usa la app solo con audio que te pertenezca o que tengas derecho a copiar.
