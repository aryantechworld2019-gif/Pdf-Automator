/**
 * Style and Theme Configuration
 * Centralized styling for easy customization
 */

import { APP_CONFIG } from './appConfig';

export const THEME = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Brand colors
    primary: APP_CONFIG.theme.colors.primary,
    secondary: APP_CONFIG.theme.colors.secondary,
    success: APP_CONFIG.theme.colors.success,
    danger: APP_CONFIG.theme.colors.danger,
    warning: APP_CONFIG.theme.colors.warning,
    info: APP_CONFIG.theme.colors.info,

    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },

    // Status colors
    status: {
      matched: '#16a34a',
      missing: '#dc2626',
      warning: '#f59e0b',
      info: '#0ea5e9'
    },

    // PDF stamp colors (RGB format for pdf-lib)
    pdf: {
      bates: { r: 0, g: 0, b: 0 },           // Black
      metadata: { r: 0.4, g: 0.4, b: 0.4 }  // Gray
    }
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  fonts: {
    // System fonts
    sans: APP_CONFIG.theme.fonts.sans,
    mono: APP_CONFIG.theme.fonts.mono,

    // PDF fonts (for pdf-lib)
    pdf: {
      bates: {
        family: APP_CONFIG.bates.font.family,
        size: APP_CONFIG.bates.font.size
      },
      metadata: {
        family: APP_CONFIG.metadata.font.family,
        size: APP_CONFIG.metadata.font.size
      }
    },

    // Font sizes
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem'  // 36px
    },

    // Font weights
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    // Base spacing unit (4px)
    base: 4,

    // Common spacings
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px

    // PDF spacing
    pdf: {
      margin: APP_CONFIG.bates.margins.x,
      characterWidth: APP_CONFIG.bates.margins.characterWidth
    }
  },

  // ============================================
  // BORDERS & SHADOWS
  // ============================================
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',   // 2px
      md: '0.375rem',   // 6px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      full: '9999px'
    },

    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px'
    }
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },

    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // ============================================
  // COMPONENT VARIANTS
  // ============================================
  components: {
    // Button variants
    button: {
      primary: {
        bg: APP_CONFIG.theme.colors.primary,
        text: '#ffffff',
        hover: '#4338ca',
        ring: APP_CONFIG.theme.colors.primary
      },
      secondary: {
        bg: '#ffffff',
        text: '#334155',
        hover: '#f1f5f9',
        ring: '#cbd5e1',
        border: '#e2e8f0'
      },
      success: {
        bg: APP_CONFIG.theme.colors.success,
        text: '#ffffff',
        hover: '#15803d',
        ring: APP_CONFIG.theme.colors.success
      },
      danger: {
        bg: APP_CONFIG.theme.colors.danger,
        text: '#ffffff',
        hover: '#b91c1c',
        ring: APP_CONFIG.theme.colors.danger
      },
      ghost: {
        bg: 'transparent',
        text: '#64748b',
        hover: '#f1f5f9'
      }
    },

    // Badge variants
    badge: {
      neutral: {
        bg: '#f1f5f9',
        text: '#334155'
      },
      success: {
        bg: '#dcfce7',
        text: '#166534'
      },
      error: {
        bg: '#fee2e2',
        text: '#991b1b'
      },
      warning: {
        bg: '#fef3c7',
        text: '#92400e'
      },
      info: {
        bg: '#dbeafe',
        text: '#1e40af'
      }
    },

    // Card styling
    card: {
      bg: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      hoverBorder: '#c7d2fe'
    }
  }
};

/**
 * Get RGB color values for pdf-lib
 * @param {Object} color - Color object with r, g, b properties
 * @returns {Array} [r, g, b] values between 0-1
 */
export function getPdfColor(color) {
  return [color.r, color.g, color.b];
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (#RRGGBB)
 * @returns {Object} { r, g, b } values between 0-1
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default THEME;
