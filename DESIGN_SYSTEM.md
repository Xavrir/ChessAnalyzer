# Punisher Coin Design System Analysis

## 🎨 Color Palette (Terminal/Cyberpunk Theme)

### Primary Colors
```css
--background-primary: #010d19      /* Deep dark blue-black */
--background-secondary: #141e1b    /* Slightly lighter dark */
--terminal-green: #01e87c          /* Bright neon green */
--terminal-blue: #00ffff           /* Cyan accent */
--terminal-red: #ff3333            /* Alert/danger red */
```

### Text Colors
```css
--text-primary: #e0ffe6            /* Very light green-tinted */
--text-secondary: #b8c5be          /* Muted gray-green */
--text-tertiary: #cbcbcb           /* Standard gray */
--text-bright: #d6e0dc             /* Bright secondary */
```

### UI Colors
```css
--button-primary-bg: rgba(140, 255, 170, 0.08)
--button-primary-color: #8cffaa
--button-primary-border: rgba(140, 255, 170, 0.15)
--button-accent-bg: #01e87c
--button-accent-color: #000
```

## 🔤 Typography

### Font Families
```css
--font-body: "Bai Jamjuree", sans-serif
--font-headings: "Poppins", sans-serif  
--font-mono: "VT323", monospace          /* Retro terminal font */
--font-accent: "Paytone One", sans-serif /* Bold display font */
```

### Font Styles
- **Headings**: Uppercase, letter-spacing: 1px, font-weight: 600
- **Body**: Regular weight, good readability
- **Mono**: Used for technical/terminal text

## 🎭 Design Characteristics

### 1. Cyberpunk/Terminal Aesthetic
- Matrix-style green terminal theme
- Scanline effects
- Glowing borders and text
- Retro computer interface vibes

### 2. Button Styles
```css
/* Primary Button */
background: rgba(140, 255, 170, 0.08)
color: #8cffaa
border: 1px solid rgba(140, 255, 170, 0.15)
backdrop-filter: blur(10px)
```

```css
/* Accent Button */
background: #01e87c
color: #000
box-shadow: 0 0 15px rgba(10, 255, 77, .7)
```

### 3. Visual Effects
- **Glow Effects**: 
  ```css
  text-shadow: 0 0 10px rgba(10, 255, 77, .5)
  box-shadow: 0 0 15px rgba(10, 255, 77, .7), 0 0 30px rgba(10, 255, 77, .4)
  ```
- **Glass morphism**: Semi-transparent backgrounds with blur
- **Borders**: Thin, glowing neon borders
- **Animations**: Smooth fade-ins, scanline effects

### 4. Layout Patterns
- Dark, immersive full-screen experience
- Card-based mission/operation displays
- Collapsible panels with accordions
- Tab navigation for content organization
- Status indicators and badges

### 5. Spacing & Grid
- Generous padding on cards
- Clear visual hierarchy
- Grouped information blocks
- Consistent border-radius on containers

## 📱 Interactive Elements

### Buttons
- Hover: Brighter glow, increased opacity
- Active: Inset shadow, color shift
- States clearly differentiated

### Cards/Panels
- Semi-transparent backgrounds
- Subtle borders with glow
- Hover effects for interactivity
- Expandable/collapsible sections

### Typography Hierarchy
1. **Headers**: Large, uppercase, bright terminal green
2. **Sub-headers**: Medium, semi-bold, slightly dimmer
3. **Body**: Regular, readable gray-green
4. **Mono/Technical**: Terminal font, technical data

## 🎯 Key UI Components

### 1. Mission Cards
- Title bar with operation name
- Status indicators
- Expandable content
- Action buttons
- Reward information

### 2. Status Displays
- Label + Value pairs
- Counters/timers
- Color-coded states
- Badges for categories

### 3. Navigation
- Tab-based switching
- Collapsible sections
- Arrow navigation
- Modal overlays

### 4. Terminal Elements
- Monospace fonts
- Green on dark background
- Blinking cursors (optional)
- Scanline overlays
- CRT screen effects

## 🎬 Animations
- Fade-ins for content
- Slide animations for panels
- Glow pulse on hover
- Scanline sweep effects
- Smooth state transitions

---

## Application to Chess Analyzer

### Theme Adaptation
We'll create a "Tactical Terminal" theme for the chess analyzer:
- Dark cyberpunk background
- Neon green/cyan accents
- Terminal-style fonts for technical data
- Glowing evaluation bars
- Matrix-inspired move list
- Glass morphism panels for engine info

### Component Mapping
- **Chessboard** → Central tactical display
- **Move List** → Mission log / Operation timeline
- **Engine Panel** → Command center / Intelligence briefing
- **Eval Bar** → Threat assessment indicator
- **Analysis Buttons** → Tactical commands
