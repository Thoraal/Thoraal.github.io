# Audio M4A iPhone

**Estado:** activo
**Actualizado:** 2026-10-27

## Objetivo
Web app estática (GitHub Pages) para extraer el audio de un MP4 en Safari de iPhone, etiquetarlo (título, artista, álbum, año, género, portada) y entregarlo como .m4a, sin servidor.

## Estado actual
- v1 completa: index.html, styles.css, app.js, vendor/ (ffmpeg.wasm 0.12.10 UMD + util 0.12.1).
- Comandos ffmpeg validados con ffmpeg nativo (copia AAC y recodificación, con portada attached_pic, brand M4A).
- Sin probar aún en un iPhone real.

## Requisitos y restricciones
- [CRÍTICO] No afirmar ni simular importación a la app Música: iOS no lo permite sin computadora (sync Finder/iTunes/Dispositivos Apple) o sin añadir en la app Música de una computadora + suscripción (Sync Library).
- [CRÍTICO] Procesamiento 100 % local; el archivo del usuario no se sube a ningún servidor.
- Sin computadora ni suscripción como requisito del usuario final.
- Sin jailbreak, perfiles ni credenciales de Apple.

## Decisiones
### D-2026-10-27-01 Núcleo ffmpeg.wasm de un solo hilo
No requiere SharedArrayBuffer ni cabeceras COOP/COEP, que GitHub Pages no permite configurar. Más lento que multihilo, aceptable para una canción.

### D-2026-10-27-02 Núcleo (31 MB .wasm) desde unpkg, wrapper vendorizado
ffmpeg.js y 814.ffmpeg.js van en /vendor porque el worker debe ser del mismo origen; el .wasm se carga con toBlobURL desde unpkg.com/@ffmpeg/core@0.12.6 para no meter 31 MB en el repo.

### D-2026-10-27-03 Estrategia de conversión
AAC/ALAC → copia sin pérdida; otro códec → AAC 256 kbps; si falla con portada → reintento sin portada. Salida -f ipod (.m4a). Portada normalizada a JPEG cuadrado ≤1000 px con canvas.

## Archivos relevantes
| Ruta | Qué contiene |
|---|---|
| index.html | Interfaz y explicación de por qué no llega a Música |
| app.js | Detección, ffmpeg, metadatos, compartir/descargar |
| styles.css | Estilos claro/oscuro, optimizado para Safari |
| README.md | Conclusión técnica, fuentes, despliegue, limitaciones |

## Último avance
2026-10-27: proyecto creado y listo para subir a GitHub.

## Próxima acción
Subir a GitHub, activar Pages y probar en iPhone con un MP4 real.

## Pendientes
- Opcional: modo offline (service worker que cachee el núcleo).
