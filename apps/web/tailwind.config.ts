import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  corePlugins: {
    // Disable Tailwind's CSS reset — we have our own in globals.css
    preflight: false,
  },
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Map our design system CSS variables to Tailwind color names
        // This makes shadcn/ui components work with our existing theme
        border: 'var(--color-border-default)',
        input: 'var(--color-border-default)',
        ring: 'var(--color-accent-primary)',
        background: 'var(--color-bg-base)',
        foreground: 'var(--color-text-primary)',
        surface: 'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        overlay: 'var(--color-bg-overlay)',
        primary: {
          DEFAULT: 'var(--color-accent-primary)',
          foreground: '#ffffff',
          hover: 'var(--color-accent-primary-hover)',
          muted: 'var(--color-accent-primary-muted)',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-elevated)',
          foreground: 'var(--color-text-primary)',
        },
        muted: {
          DEFAULT: 'var(--color-bg-surface)',
          foreground: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-bg-hover)',
          foreground: 'var(--color-text-primary)',
          amber: 'var(--color-accent-secondary)',
          violet: 'var(--color-accent-tertiary)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: '#ffffff',
          muted: 'var(--color-error-muted)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          muted: 'var(--color-success-muted)',
        },
        card: {
          DEFAULT: 'var(--color-bg-surface)',
          foreground: 'var(--color-text-primary)',
        },
        popover: {
          DEFAULT: 'var(--color-bg-elevated)',
          foreground: 'var(--color-text-primary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          disabled: 'var(--color-text-disabled)',
        },
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(40px,6vw,72px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['clamp(28px,4vw,40px)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['clamp(20px,2.5vw,28px)', { lineHeight: '1.3' }],
        'h3': ['clamp(16px,2vw,20px)', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-aurora': 'var(--gradient-aurora)',
        'gradient-poster': 'var(--gradient-poster)',
        'gradient-brand': 'var(--gradient-brand)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.25s ease forwards',
        'fade-in': 'fade-in 0.25s ease forwards',
        'scale-in': 'scale-in 0.15s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      zIndex: {
        dropdown: '100',
        sticky: '200',
        overlay: '300',
        modal: '400',
        toast: '500',
      },
      maxWidth: {
        site: '1400px',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};

export default config;
