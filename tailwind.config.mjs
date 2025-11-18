/**
 * Tailwind CSS Configuration
 * @type {import('tailwindcss').Config}
 *
 * This configuration extends Tailwind CSS with custom colors based on CSS custom properties
 * defined in src/styles/theme.css. It allows for dynamic theming through environment variables
 * and CSS custom properties while maintaining type-safe Tailwind utility classes.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /**
       * Custom color system based on CSS custom properties
       * These map to the variables defined in src/styles/theme.css
       *
       * Usage examples:
       * - bg-primary, text-primary, border-primary
       * - bg-secondary, text-secondary
       * - bg-hero-foreground, text-hero-foreground
       */
      colors: {
        // Primary brand colors
        'primary': {
          DEFAULT: 'var(--color-primary)',
          strong: 'var(--color-primary-strong)',
          soft: 'var(--color-primary-soft)',
          foreground: 'var(--color-primary-foreground)',
        },

        // Secondary brand colors
        'secondary': {
          DEFAULT: 'var(--color-secondary)',
          strong: 'var(--color-secondary-strong)',
          soft: 'var(--color-secondary-soft)',
          foreground: 'var(--color-secondary-foreground)',
        },

        // Hero section colors
        'hero': {
          foreground: 'var(--color-hero-foreground)',
          muted: 'var(--color-hero-muted)',
          border: 'var(--color-hero-border)',
        },

        // Surface colors for cards, inputs, etc.
        'surface': {
          card: 'var(--color-surface-card)',
          border: 'var(--color-surface-border)',
          input: 'var(--color-surface-input)',
        },

        // Input-specific colors
        'input': {
          border: 'var(--color-input-border)',
        },

        // Background colors
        'bg': {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },

        // Text colors
        'text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },

        // Text colors for surfaces
        'text-on-surface': 'var(--color-text-on-surface)',
        'text-muted-on-surface': 'var(--color-text-muted-on-surface)',
      },

      /**
       * Custom box shadows based on CSS custom properties
       *
       * Usage examples:
       * - shadow-soft, shadow-elevated, shadow-button
       */
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'elevated': 'var(--shadow-elevated)',
        'button': 'var(--shadow-button)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },

      /**
       * Custom background images for gradients
       *
       * Usage examples:
       * - bg-gradient-hero
       */
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      },

      /**
       * Custom border radius values
       * Matching the values used in theme.css
       */
      borderRadius: {
        'card': 'clamp(1.5rem, 2.5vw, 1.85rem)',
        'input': '1rem',
        'error': '0.9rem',
        '4xl': '2rem',
      },

      /**
       * Custom backdrop blur values
       */
      backdropBlur: {
        card: '24px',
        xs: '2px',
      },

      /**
       * Custom animations
       */
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },

      /**
       * Custom spacing for consistent layouts
       */
      spacing: {
        18: '4.5rem',
        112: '28rem',
        128: '32rem',
      },
    },
  },
  plugins: [],
};
