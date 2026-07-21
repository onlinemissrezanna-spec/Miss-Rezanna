# MISS REZANNA - Master Design System

Welcome to the absolute single source of truth for the MISS REZANNA digital platform.

## Principles
1. **Luxury is Subtractive:** Do not add elements unless absolutely necessary.
2. **Editorial Focus:** Sharp corners, massive typography contrast, and muted palettes.
3. **App-like Performance:** Sticky mobile navigations, fast CSS transitions, swipeable galleries.

## Directory Structure
- `/tokens/`: The atomic variables (colors, fonts, spacing).
- `/layout/`: The structural grid and responsive rules.
- `/components/`: The reusable CSS blocks.
- `/theme/`: Variable registry.
- `/styles/`: The `main.css` entry point.

## Usage
Every HTML file in the project should ONLY link to:
```html
<link rel="stylesheet" href="design-system/styles/main.css">
```
Do not write inline styles. Do not write custom page-specific CSS unless strictly necessary.

## Typography
- **Headings**: Cormorant Garamond
- **Body**: Inter

## Colors
- **Signature Magenta**: `#B5335B`
- **Ivory Background**: `#F8F6F2`

*Developed for scalable luxury architecture.*
