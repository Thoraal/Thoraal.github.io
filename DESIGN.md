---
name: THORAL Digital Atelier
description: Calibrated four-zone dark architectural showcase with anodized 3D sculpture and surgical signal-orange illumination.
colors:
  signal-orange: "#e85d24"
  signal-orange-hover: "#f36e38"
  ink-on-orange: "#0b0d11"
  void-carbon: "#0b0d11"
  matte-obsidian: "#12151b"
  smoked-slate: "#191e26"
  architectural-slab: "#202630"
  architectural-slab-hover: "#262d39"
  bone-ivory: "#eee8df"
  warm-stone: "#b8b1a7"
  architectural-ash: "#948d83"
typography:
  display:
    fontFamily: "'Urbanist Variable', system-ui, -apple-system, sans-serif"
    fontSize: "5.25rem"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  display-mobile:
    fontFamily: "'Urbanist Variable', system-ui, -apple-system, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Urbanist Variable', system-ui, -apple-system, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Urbanist Variable', system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "'Hanken Grotesk Variable', system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.55
  body:
    fontFamily: "'Hanken Grotesk Variable', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "'Hanken Grotesk Variable', system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "'Azeret Mono Variable', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
spacing:
  2xs: "6px"
  xs: "10px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
  2xl: "104px"
components:
  button-signal:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.ink-on-orange}"
    rounded: "{rounded.xs}"
    padding: "12px 23px"
  button-signal-hover:
    backgroundColor: "{colors.signal-orange-hover}"
  button-architectural:
    backgroundColor: "{colors.architectural-slab}"
    textColor: "{colors.bone-ivory}"
    rounded: "{rounded.xs}"
    padding: "12px 22px"
  button-architectural-hover:
    backgroundColor: "{colors.architectural-slab-hover}"
---

# Design System: THORAL Digital Atelier

## Overview

**Creative North Star: "The Anodized Monolith Atelier"**

THORAL frames creative engineering as a precision-machined industrial artifact suspended between split obsidian and smoked-slate studio planes. Rather than relying on decorative gradients, glowing neon borders, or uniform SaaS card rows, the interface uses stepped dark architectural volumes, `1px` warm-bone seams, weight-contrasted geometric display type, and a real-time WebGL anodized monolith occluding an incandescent forged-orange orbital halo.

**Key Characteristics:**
- Calibrated four-zone dark architectural planes separating sections and hero volumes without heavy borders.
- Extreme weight-contrast display typography pairing ExtraBold (`800`) architectural stems directly against ExtraLight (`200`) hairline uppercase counterpoints.
- Real-time Three.js PBR anodized metal surfaces with procedural sandblasted grain and occluded Fresnel thermal rim light.
- 100% custom geometric SVG emblem, technical plates, and stroke iconography with zero emojis.

## Colors

**The Four-Zone Plane Rule.** Dark grounds never collapse into flat `#000000` or muddy gray; every structural layer steps intentionally across Abyssal Void, Matte Obsidian, Smoked Slate, and Floating Slab.

**The Surgical Signal Rule.** Signal Orange reserves its presence for the occluded 3D orbital halo, the primary conversion trigger, and active depth-rail or tab registration. Never dilute it across body text or multi-stop text gradients.

**The Warm-Bone Tint Rule.** Secondary and metadata text carry warm bone tinting rather than neutral gray, preserving ≥ 4.5:1 WCAG AA legibility across all four dark planes.

### Primary
- **Signal Orange** (`{colors.signal-orange}`): Primary CTA fill, 3D thermal halo core, active index indicator.
- **Signal Orange Hover** (`{colors.signal-orange-hover}`): Pointer hover elevation on primary CTAs.
- **Ink on Orange** (`{colors.ink-on-orange}`): High-contrast carbon ink set over Signal Orange fills (6.6:1 contrast).

### Neutral
- **Void Carbon** (`{colors.void-carbon}`): Deepest studio floor for Identity, Contact outer stage, and Footer.
- **Matte Obsidian** (`{colors.matte-obsidian}`): Primary left hero stage and Selected Work gallery ground.
- **Smoked Slate** (`{colors.smoked-slate}`): Right split hero plane and Expertise matrix ground.
- **Architectural Slab** (`{colors.architectural-slab}`): Floating specification plaques and active control surfaces.
- **Bone Ivory** (`{colors.bone-ivory}`): Primary display, headings, and key interactive labels.
- **Warm Stone** (`{colors.warm-stone}`): Editorial prose and hairline display counterpoints.
- **Architectural Ash** (`{colors.architectural-ash}`): Tabular coordinates, timestamps, and parameter labels.

## Typography

**The Weight-Counterpoint Rule.** Every major heading pairs an ExtraBold (`800`) primary word with an ExtraLight (`200`) uppercase companion instead of relying on decorative eyebrows or kickers above headings.

**The Self-Hosted Zero-CLS Rule.** Urbanist Variable, Hanken Grotesk Variable, and Azeret Mono Variable ship from local `@fontsource-variable` `.woff2` bundles with `tabular-nums` enforced on indices and metrics.

- **Display:** Urbanist Variable (`clamp(2.35rem, 5.2vw, 5.2rem)`), tight `-0.025em` tracking on bold lines and `+0.08em` on hairline lines.
- **Headline & Title:** Urbanist Variable (`clamp(1.9rem, 3.6vw, 3.45rem)` and `clamp(1.35rem, 2.1vw, 2.05rem)`), `text-wrap: balance`.
- **Body:** Hanken Grotesk Variable (`1rem`, `1.65` line-height, `45–62ch` measure, `text-wrap: pretty`).
- **Label / Index:** Azeret Mono Variable (`0.78rem`, `font-variant-numeric: tabular-nums`) reserved strictly for coordinates, chapter numbers, and technical metadata.

## Layout

**The Asymmetric Studio Grid Rule.** Desktop viewports (`≥ 960px`) use a 12-column architectural grid with a persistent left vertical depth rail (`01–05` at `≥ 1120px`), split background planes, and staggered 12 / 7 / 5 / 11-column project compositions rather than uniform card rows.

- **Responsive Adaptation:** Mobile viewports (`320px–767px`) recompose into a dedicated vertical totem with full-width tactile actions (`min-height: 48px`), safe-area insets (`env(safe-area-inset-*)`), `touch-action: pan-y` on the 3D stage so vertical scrolling never snags, and a full-screen navigation drawer.
- **Container Ceiling:** Maximum frame width of `96rem` (`1536px`) keeps ultrawide and 4K displays anchored while split background planes extend edge-to-edge.

## Elevation & Depth

**The Physical Occlusion Rule.** Spatial hierarchy comes first from tonal plane steps (`1px` `rgba(238, 232, 223, 0.08)` hairline seams) and real 3D occlusion in the WebGL stage, supported by directional Y-offset studio shadows (`0 24px 56px rgba(4, 6, 9, 0.56)`) on floating slabs and `-20px 0 64px rgba(3, 5, 8, 0.72)` on slide-over inspection sheets. Zero-offset neon glow shadows are prohibited.

## Shapes

- **Sharp Architectural Corners:** Controls and plaques use crisp `2px` (`{rounded.xs}`) chamfers, echoing CNC-milled anodized hardware.
- **Circular Contrast Accents:** Only the orbital 3D halo and the radial studio play trigger use pure `50%` circular geometry, creating deliberate tension against rectilinear slabs.

## Components

### Buttons
- **Signal Button (`button-signal`):** Solid Signal Orange fill with Void Carbon ink, uppercase tracked Urbanist (`800`), `48px` minimum touch height, `-1px` vertical translate on pointer hover.
- **Architectural Button (`button-architectural`):** Floating Slab fill with `1px` warm-bone seam (`rgba(238, 232, 223, 0.18)`), Bone Ivory label, elevating to Slab Hover on pointer devices.

### Navigation
- **Perimeter Header & Depth Rail:** Fixed `4.5rem` translucent obsidian header (`backdrop-filter: blur(12px)`) paired with a left `01–05` depth rail whose active chapter expands a `20px × 2px` Signal Orange bar. Collapses cleanly into a full-screen accessible modal drawer below `960px`.

### Case Study Inspection Sheet
- **Slide-Over Architectural Drawer:** Full-height right-docked inspection panel (`max-width: 44rem`) with keyboard Escape/Arrow navigation, focus restoration, and live Studio Render vs. Technical Wireframe SVG plate switching.

## Do's and Don'ts

### Do:
- **Do** separate adjacent structural regions using the four calibrated dark plane tokens and `1px` warm-bone seams (`rgba(238, 232, 223, 0.08)`).
- **Do** lead every section directly with bold/hairline weight-contrasted `Urbanist Variable` headings without placing small kicker labels above them.
- **Do** maintain `min-height: 44px` on all interactive controls and preserve `prefers-reduced-motion` state transitions without spatial motion.

### Don't:
- **Don't** introduce emojis or Unicode symbols anywhere in UI or metadata; author `1.6px` stroke SVGs or geometric marks.
- **Don't** apply gradient fills to typography or zero-offset colored glow shadows to containers.
- **Don't** arrange projects or capabilities into uniform three-column icon-heading-paragraph card grids.
