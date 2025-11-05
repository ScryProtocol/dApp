// V2 Theme - Modern, cute style with vibrant gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  secondary: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  sunset: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  ocean: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  lavender: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  emerald: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  mesh: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
};

export const colors = {
  primary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
  },
  secondary: {
    main: '#ec4899',
    light: '#f472b6',
    dark: '#db2777',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
  },
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
};

export const shadows = {
  light: '0px 4px 24px rgba(99, 102, 241, 0.08)',
  medium: '0px 8px 32px rgba(99, 102, 241, 0.1)',
  heavy: '0px 12px 48px rgba(99, 102, 241, 0.16)',
  hover: '0px 20px 60px rgba(99, 102, 241, 0.3)',
};
