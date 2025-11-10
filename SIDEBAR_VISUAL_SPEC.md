# 🎨 Especificación Visual del Sidebar Mejorado

## Paleta de Colores

```
┌─────────────────────────────────────────────────────────┐
│                    PALETA PRINCIPAL                      │
├─────────────────────────────────────────────────────────┤
│ 🔵 Primario:        #3b82f6  (Azul)                      │
│ 🔵 Primario Oscuro: #2563eb  (Azul Oscuro)              │
│ ⚪ Neutro Claro:     #f1f5f9  (Gris muy claro)           │
│ ⚪ Neutro Medio:     #e5e7eb  (Gris claro)               │
│ ⚫ Texto Secundario: #6b7280  (Gris medio)               │
│ ⚫ Texto Principal:  #222     (Negro)                    │
└─────────────────────────────────────────────────────────┘
```

## Estructura del Sidebar

```
┌──────────────────────────────────────────────┐
│  📦 GESTOR DE STOCK  ← Logo con fondo azul   │ ← Borde inferior
├──────────────────────────────────────────────┤
│                                              │
│  📊 Dashboard          ← Item Activo         │
│  │(borde izq azul + bg gradiente + sombra)  │
│  │                                          │
│  📦 Productos         ← Item Normal          │
│                                              │
│  🛒 Ventas            ← Item con Hover      │
│     (al pasar mouse)                        │
│                                              │
│  ⚙️  Perfil            ← Item Normal          │
│                                              │
│                                              │
│                                              │
└──────────────────────────────────────────────┘ ← Borde derecho 2px
```

## Estados del Nav-Item

### 1️⃣ Estado Normal (Default)
```css
Padding:      14px 16px
Color:        #6b7280 (Gris)
Background:   Transparent
Border:       2px transparent
Cursor:       pointer
Font-weight:  500
Transition:   0.3s cubic-bezier
```

### 2️⃣ Estado Hover
```css
Padding:      14px 16px (sin cambio)
Color:        #3b82f6 (Azul)
Background:   rgba(59, 130, 246, 0.08) (Azul muy suave)
Border-left:  3px solid #3b82f6
Transform:    translateX(4px) (desliza 4px a la derecha)
Indicador:    Barra gradiente en lado derecho
```

### 3️⃣ Estado Activo (Selected)
```css
Padding:      14px 16px (sin cambio)
Color:        #3b82f6 (Azul)
Background:   Gradiente sutil con azul
Border:       2px solid #3b82f6
Border-left:  4px solid #3b82f6 (más grueso)
Box-shadow:   inset + externa (profundidad)
Font-weight:  600 (más bold)
Indicador:    Barra gradiente en ambos lados
Transform:    ninguno (posición fija)
```

## Animaciones y Transiciones

### Transición General
```
Duración:  0.3s
Timing:    cubic-bezier(0.4, 0, 0.2, 1)
(Más rápido al inicio, más lento al final)
```

### Transformaciones Aplicadas
```
En Hover:
  - Icono:  scale(1.1)    ← 10% más grande
  - Item:   translateX(4px) ← 4 píxeles a la derecha

En Activo:
  - Icono:  scale(1.15)   ← 15% más grande
  - Item:   sin cambio (posición fija)
```

## Sombras Aplicadas

### Sidebar (borde derecho)
```css
box-shadow: 2px 0 12px rgba(0, 0, 0, 0.05)
Dirección:  Derecha (2px)
Desenfoque: 12px
Color:      Negro 5% de opacidad
Efecto:     Separación sutil del contenido
```

### Logo al pasar mouse
```css
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2)
Dirección:  Abajo (4px)
Desenfoque: 12px
Color:      Azul 20% de opacidad
Efecto:     Levantamiento visual
```

### Nav-item Activo
```css
Box-shadow (interna): inset 0 2px 8px rgba(59, 130, 246, 0.1)
Box-shadow (externa): 0 4px 12px rgba(59, 130, 246, 0.15)
Efecto:   Profundidad y resaltado
```

## Breakpoints Responsivos

### 📱 Mobile (<640px)
```
Ancho sidebar:    100% max-width: 280px
Posición:         Fixed (fuera de pantalla por defecto)
Transición:       left 0.3s cubic-bezier
Z-index:          99 (sobre contenido)
Shadow:           4px 0 16px rgba(0,0,0,0.1)
Padding:          16px
```

### 📱 Tablet (768px - 1024px)
```
Ancho:            240px
Padding:          16px 8px
Nav-item:         Reducido 12px 14px
Font-size:        14px
```

### 🖥️ Desktop (>1024px)
```
Ancho:            280px
Padding:          24px 12px
Nav-item:         14px 16px
Font-size:        15px
Sticky:           top: 80px
```

## Efectos Gradiente

### Logo Sidebar
```
Dirección:  135deg (esquina a esquina)
Color 1:    #3b82f6 (azul)
Color 2:    #2563eb (azul oscuro)
Efecto:     Botón llamativo y profesional
```

### Header Sidebar
```
Dirección:  135deg
Color 1:    #ffffff (blanco)
Color 2:    #fafbfc (gris muy claro)
Efecto:     Separación sutil del contenido
```

### Nav-item Activo
```
Dirección:  135deg
Color 1:    rgba(59, 130, 246, 0.12) (azul muy claro)
Color 2:    rgba(59, 130, 246, 0.06) (azul aún más claro)
Efecto:     Fondo sutil que destaca sin saturar
```

## Indicadores Visuales

### Barra Izquierda (Active)
```
┌──────────────────────────────
│ █ ← 4px sólido en leftizquierda
│   Color: #3b82f6
│   Altura: llena el item
└──────────────────────────────
```

### Barra Derecha (Hover y Active)
```
┌──────────────────────────────────┐
│                                  █ ← 3px en derecha
│  Gradiente top-to-bottom        █ ← Solo en el centro
│  rgba(59,130,246,0) → #3b82f6  █ ← (efecto suave)
│                                  █
└──────────────────────────────────┘
```

## Espaciado (Spacing)

```
Sidebar total width:     280px
├─ Header padding:       32px (arriba) | 24px (lados)
├─ Nav padding:          24px (vertical) | 12px (horizontal)
├─ Nav-item padding:     14px (vertical) | 16px (horizontal)
├─ Nav-item margin-b:    8px
└─ Item gap (icon-text): 14px

Content padding:
├─ Desktop:              32px
├─ Tablet:               24px
└─ Mobile:               16px
```

## Mejoras de Accesibilidad

✅ Suficiente contraste de color (WCAG AA)
✅ Objetivos táctiles suficientes (min 48px en mobile)
✅ Estados claramente diferenciados
✅ Transiciones respetan `prefers-reduced-motion`
✅ Iconografía con texto (no solo iconos)
✅ Focus states (para navegación teclado)

---

**Diseño actualizado**: Noviembre 10, 2025
**Versión CSS**: 2.0
