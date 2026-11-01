# THORAL — Digital Atelier & Interactive 3D Portfolio

Portfolio digital inmersivo y tridimensional desarrollado para **THORAL** (`https://thoraal.github.io/`), concebido bajo una dirección de arte **Dark Luxury + Futuristic Editorial + Interactive 3D**.

## Arquitectura y Tecnologías

- **Frontend:** React 19 + TypeScript + Vite 6
- **Escena 3D & Shaders:** Three.js + Shaders GLSL personalizados (Fresnel térmico, grano anodizado procedural, iluminación de estudio y carga diferida con respaldo vectorial sin WebGL)
- **Motion & Coreografía:** GSAP + ScrollTrigger con soporte nativo para `prefers-reduced-motion`
- **Tipografía Autoalojada:** Urbanist Variable + Hanken Grotesk Variable + Azeret Mono Variable (`@fontsource-variable`, cero bloqueo externo y cero CLS)
- **Iconografía:** 100% vectorial en SVG (emblema geométrico original THORAL, láminas técnicas e iconos Lucide)
- **CI/CD:** Despliegue automático en GitHub Pages mediante GitHub Actions (`.github/workflows/deploy.yml`)

## Personalización de Contenidos

Toda la información personal, biografía provisional, proyectos demostrativos, áreas de especialidad y canales de contacto se gestionan desde un único archivo tipado:

- [`src/config/portfolio.ts`](src/config/portfolio.ts)

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar versión de producción
npm run build

# Previsualizar compilación de producción
npm run preview
```

## Licencia

MIT — Ver [LICENSE](LICENSE).
