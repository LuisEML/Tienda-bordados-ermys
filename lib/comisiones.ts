// lib/comisiones.ts

/**
 * Calcula el precio final para e-commerce absorbiendo la comisión de pasarela
 * Tarifa base utilizada (Stripe MX con IVA): 3.6% + $3.00 MXN -> (4.176% + $3.48 MXN con IVA 16%)
 */
export function calcularPrecioWebConComision(precioBase: number): number {
  if (!precioBase || precioBase <= 0) return 0;

  const PORCENTAJE_CON_IVA = 0.04176; // 3.6% * 1.16
  const FIJO_CON_IVA = 3.48;          // $3.00 * 1.16

  // Fórmula de margen neto
  const precioWebExacto = (precioBase + FIJO_CON_IVA) / (1 - PORCENTAJE_CON_IVA);

  // Redondeamos hacia arriba para no perder centavos
  return Math.ceil(precioWebExacto);
}
