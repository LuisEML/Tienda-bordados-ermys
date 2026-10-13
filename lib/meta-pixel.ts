// lib/meta-pixel.ts

export const META_PIXEL_ID = '1088902790546523'; // Reemplaza con tu ID real de Meta

export const trackEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options);
  }
};
