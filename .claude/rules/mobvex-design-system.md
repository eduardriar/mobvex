# Mobvex — Design System
 
Sistema de diseño base para la aplicación móvil Mobvex. Define los tokens de color, tipografía y reglas de uso para mantener consistencia visual en todas las pantallas.
 
---
 
## Colores
 
### Paleta base
 
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0A0A0B` | Fondo principal de la app |
| `--surface` | `#111114` | Superficies de primer nivel (cards, modales) |
| `--surface2` | `#18181C` | Superficies de segundo nivel (inputs, chips) |
| `--border` | `#2A2A30` | Bordes de componentes en reposo |
 
### Texto
 
| Token | Hex | Uso |
|---|---|---|
| `--text` | `#F0F0F0` | Texto principal, títulos, labels activos |
| `--muted` | `#6B6B78` | Texto secundario, placeholders, hints, subtítulos |
 
### Acentos
 
| Token | Hex | Uso |
|---|---|---|
| `--accent` | `#C8FF00` | Acento primario. CTA principal, progreso, selección activa, iconos de estado positivo |
| `--accent2` | `#FF4D6D` | Acento secundario. Errores, alertas, estados de advertencia |
 
### Uso de acentos sobre fondos oscuros
 
El acento `#C8FF00` (verde neón) sobre `#0A0A0B` tiene una relación de contraste superior a 7:1, cumpliendo WCAG AAA. No usar el acento sobre superficies claras.
 
Jerarquía de capas:
 
```
#0A0A0B  ← fondo app
  #111114  ← card / modal
    #18181C  ← input / chip / inner surface
      #2A2A30  ← borde del componente
```
 
### Variantes de acento con opacidad
 
Para fondos de tarjetas con estado activo o highlight, usar el acento con opacidad en lugar de color sólido:
 
| Uso | Valor |
|---|---|
| Background de tarjeta activa | `rgba(200, 255, 0, 0.08)` |
| Borde de tarjeta activa | `rgba(200, 255, 0, 0.30)` |
| Background de avatar / icono | `rgba(200, 255, 0, 0.12)` |
| Borde de avatar / icono | `rgba(200, 255, 0, 0.30)` |
| Glow exterior del contenedor | `rgba(200, 255, 0, 0.06)` |
 
Para el acento secundario (`#FF4D6D`):
 
| Uso | Valor |
|---|---|
| Background de alerta | `rgba(255, 77, 109, 0.10)` |
| Borde de alerta | `rgba(255, 77, 109, 0.25)` |
 
---
 
## Tipografía
 
### Familias
 
| Rol | Familia | Importar desde |
|---|---|---|
| Display / Títulos | `Bebas Neue` | Google Fonts |
| Cuerpo / UI | `DM Sans` | Google Fonts |
 
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
```
 
```css
--font-display: 'Bebas Neue', sans-serif;
--font-body:    'DM Sans', sans-serif;
```
 
### Bebas Neue — Display
 
Usada exclusivamente para títulos de pantalla, nombre de marca y botones primarios. No usar para cuerpo de texto ni labels secundarios.
 
| Elemento | Tamaño | Letter-spacing | Color |
|---|---|---|---|
| Logo / marca | `42px` | `2px` | `#F0F0F0` + `#C8FF00` en acento |
| Título de pantalla | `36px` | `1px` | `#F0F0F0` |
| Subtítulo display | `28px` | `1px` | `#F0F0F0` |
| Botón primario | `20px` | `2px` | `#0A0A0B` (texto oscuro sobre fondo neón) |
 
### DM Sans — Cuerpo
 
Usada para todo el contenido funcional: inputs, labels, subtítulos, hints, chips, tarjetas.
 
| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Subtítulo de pantalla | `15px` | `400` | `#6B6B78` |
| Label de campo (uppercase) | `11px` | `500` | `#6B6B78` |
| Texto de input | `16px` | `400` | `#F0F0F0` |
| Placeholder | `16px` | `400` | `#6B6B78` |
| Chip / selector | `13px` | `400` | `#6B6B78` → `#C8FF00` activo |
| Texto de tarjeta — nombre | `15px` | `500` | `#F0F0F0` |
| Texto de tarjeta — rol | `12px` | `400` | `#6B6B78` |
| Badge / pill | `11px` | `500` | `#C8FF00` |
| Hint / aviso | `13px` | `400` | `#FF4D6D` |
| Legales / footnote | `12px` | `400` | `#6B6B78` |
| Link inline | `13–14px` | `400` | `#C8FF00` |
 
### Labels de campo
 
Los labels de campo usan `text-transform: uppercase` y `letter-spacing: 1.5px` para diferenciarse visualmente del cuerpo. Siempre en `#6B6B78`.
 
```css
.label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6B6B78;
}
```
 
---
 
## Componentes — Reglas de uso
 
### Botón primario
 
Fondo `#C8FF00`, texto `#0A0A0B` en Bebas Neue. Border-radius `14px`. El único componente con color de fondo sólido y de alto contraste.
 
```css
background: #C8FF00;
color: #0A0A0B;
border-radius: 14px;
font-family: 'Bebas Neue', sans-serif;
font-size: 20px;
letter-spacing: 2px;
```
 
### Botón secundario
 
Fondo transparente, borde `#2A2A30`, texto `#6B6B78`. En hover: borde `#F0F0F0`, texto `#F0F0F0`.
 
### Inputs
 
Fondo `#18181C`, borde `#2A2A30` en reposo, borde `#C8FF00` en foco. Border-radius `14px`.
 
### Chips / selectores
 
Estado inactivo: fondo `#18181C`, borde `#2A2A30`, texto `#6B6B78`.
Estado activo: fondo `rgba(200,255,0,0.08)`, borde `rgba(200,255,0,0.30)`, texto `#C8FF00`.
 
### Tarjetas (cards)
 
Fondo `#18181C`, borde `#2A2A30`, border-radius `18px`, padding `18px`.
 
### Badges / pills
 
Fondo `rgba(200,255,0,0.10)`, borde `rgba(200,255,0,0.30)`, texto `#C8FF00`, font-size `11px`, padding `4px 10px`, border-radius `8px`.
 
---
 
## Espaciado
 
| Token | Valor | Uso típico |
|---|---|---|
| `xs` | `8px` | Gap entre elementos pequeños |
| `sm` | `14px` | Gap entre componentes dentro de una sección |
| `md` | `16px` | Padding interno de inputs y chips |
| `lg` | `24px` | Padding horizontal de pantalla |
| `xl` | `28–32px` | Separación entre secciones |
| `2xl` | `48px` | Padding superior en pantallas de inicio |
 
Border-radius estándar: `14px` para inputs y botones, `18px` para tarjetas, `40px` para el contenedor de la app (marco del dispositivo).
 
---
 
## Efectos decorativos
 
### Noise overlay
 
Todas las pantallas llevan una textura de ruido sutil (opacidad `0.04`) sobre el fondo para romper la planitud del negro puro. Implementado como SVG inline con `feTurbulence`.
 
### Glow del contenedor
 
El contenedor principal de la app lleva un `box-shadow: 0 0 80px rgba(200, 255, 0, 0.06)` para dar profundidad ambiental sin resultar llamativo.
 
### Línea decorativa de acento
 
Elemento de `40px × 3px`, color `#C8FF00`, border-radius `2px`. Se usa debajo del logo en la pantalla de bienvenida como separador de marca.
 
---
 
## Principios visuales
 
**Oscuridad como base.** El negro no es ausencia — es el lienzo. Las capas de superficie se elevan apenas lo suficiente para distinguirse.
 
**El neón como señal.** El `#C8FF00` aparece solo donde el usuario necesita actuar o donde hay información positiva. Su escasez es lo que le da potencia.
 
**Tipografía con contraste de roles.** Bebas Neue para lo que se grita (marca, acción), DM Sans para lo que se susurra (información, contexto). Nunca mezclar roles.
 
**Sin ruido visual innecesario.** Sombras mínimas, sin gradientes decorativos, sin iconografía excesiva. El peso visual viene de la tipografía y el color, no de los efectos.
 