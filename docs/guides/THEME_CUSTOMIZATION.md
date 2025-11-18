# Theme Customization Guide

This Next.js boilerplate features a unique, customizable theme system built on Tailwind CSS v4, using CSS custom properties for easy configuration.

## Default Theme - Cosmic Purple

The boilerplate ships with a distinctive **Cosmic Purple** theme that sets it apart from typical blue-based designs:

- **Primary Color**: Vibrant Purple (`#8b5cf6`)
- **Secondary Color**: Vivid Pink (`#ec4899`)
- **Design Philosophy**: Modern, energetic, and memorable

## Theme Variants

The theme system includes four pre-configured variants:

### 1. Default (Cosmic Purple)

```typescript
// No configuration needed - this is the default
```

### 2. Aurora (Cyan & Purple)

```typescript
import { setThemeVariant } from '@/theme';

setThemeVariant('aurora');
```

### 3. Sunset (Amber & Red)

```typescript
import { setThemeVariant } from '@/theme';

setThemeVariant('sunset');
```

### 4. Ocean (Blue & Teal)

```typescript
import { setThemeVariant } from '@/theme';

setThemeVariant('ocean');
```

## Custom Colors

### Using CSS Variables

You can customize colors at runtime using the theme API:

```typescript
'use client';

import { setThemePalette } from '@/theme';

// Set custom brand colors
setThemePalette({
  primary: '#1d4ed8', // Custom primary color
  secondary: '#f97316', // Custom secondary color
});
```

### Modifying Theme Files

For permanent customization, edit the CSS custom properties in `src/styles/theme.css`:

```css
:root {
  --color-primary: #your-primary-color;
  --color-secondary: #your-secondary-color;

  /* Brand color scales (50-950) */
  --color-brand-600: #your-primary-color;
  --color-accent-500: #your-secondary-color;
}
```

## Tailwind CSS Integration

The theme automatically integrates with Tailwind CSS v4. Custom utility classes are available:

### Brand Colors

```jsx
function BrandExample() {
  return (
    <>
      <div className="bg-brand text-white">Primary brand background</div>
      <div className="bg-accent text-white">Accent background</div>
      <p className="text-brand">Brand colored text</p>
    </>
  );
}
```

### Gradients

```jsx
function GradientExample() {
  return (
    <>
      <div className="bg-gradient-brand">Gradient from primary to accent</div>
      <div className="bg-gradient-brand-soft">Soft gradient background</div>
    </>
  );
}
```

### Borders

```jsx
function BorderExample() {
  return <div className="border-brand border-2">Brand colored border</div>;
}
```

## Color Scale

The theme provides a complete color scale (50-950) for both brand and accent colors:

```jsx
function ColorScaleExample() {
  return (
    <>
      <div className="bg-brand-50">Lightest</div>
      <div className="bg-brand-100">...</div>
      <div className="bg-brand-500">Base</div>
      <div className="bg-brand-900">...</div>
      <div className="bg-brand-950">Darkest</div>
    </>
  );
}
```

## Theme Components

Pre-styled theme components are available in `src/styles/theme.css`:

### Hero Section

```jsx
function HeroExample() {
  return (
    <section className="theme-hero">
      <div className="theme-hero__glow">
        <span className="theme-hero__orb theme-hero__orb--primary"></span>
        <span className="theme-hero__orb theme-hero__orb--secondary"></span>
      </div>
      {/* Your content */}
    </section>
  );
}
```

### Cards

```jsx
function CardExample() {
  return (
    <div className="theme-card">
      <h3 className="theme-card__title">Card Title</h3>
      <p className="theme-card__subtitle">Card description</p>
    </div>
  );
}
```

### Buttons

```jsx
function ButtonExample() {
  return (
    <>
      <button className="btn btn-primary">Primary Button</button>
      <button className="btn btn-outline">Outline Button</button>
    </>
  );
}
```

### Form Inputs

```jsx
function FormExample() {
  return (
    <label className="theme-label">
      Email
      <input
        className="theme-input"
        placeholder="you@example.com"
        type="email"
      />
    </label>
  );
}
```

## Design Tokens

Custom design tokens are defined in `src/styles/tailwind.config.css`:

### Spacing

- `--spacing-xs` through `--spacing-2xl`

### Typography

- `--font-size-xs` through `--font-size-4xl`

### Border Radius

- `--radius-sm` through `--radius-full`

## Best Practices

1. **Use CSS Variables**: Leverage the CSS custom properties for consistent theming
2. **Theme Variants**: Switch between pre-defined themes for different sections or user preferences
3. **Runtime Customization**: Allow users to customize colors using `setThemePalette()`
4. **Accessibility**: Ensure sufficient color contrast when customizing colors
5. **Brand Consistency**: Use the brand color utilities for primary UI elements

## Example: User Theme Selector

```typescript
'use client';

import type { ThemeVariant } from '@/theme';
import { setThemeVariant } from '@/theme';
import { useState } from 'react';

export function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeVariant>('default');

  const handleThemeChange = (newTheme: ThemeVariant) => {
    setTheme(newTheme);
    setThemeVariant(newTheme);
  };

  const changeToDefault = () => handleThemeChange('default');
  const changeToAurora = () => handleThemeChange('aurora');
  const changeToSunset = () => handleThemeChange('sunset');
  const changeToOcean = () => handleThemeChange('ocean');

  return (
    <div>
      <button type="button" onClick={changeToDefault}>
        Cosmic Purple
      </button>
      <button type="button" onClick={changeToAurora}>
        Aurora
      </button>
      <button type="button" onClick={changeToSunset}>
        Sunset
      </button>
      <button type="button" onClick={changeToOcean}>
        Ocean
      </button>
    </div>
  );
}
```

## Further Customization

The theme system is built to be extended. You can:

- Add new theme variants in `src/styles/theme.css`
- Create custom utility classes in `src/styles/tailwind.config.css`
- Define new design tokens as CSS custom properties
- Build theme-aware components using the CSS variables

For more information, see the [README](./README.md) and explore the theme files in `src/styles/`.
