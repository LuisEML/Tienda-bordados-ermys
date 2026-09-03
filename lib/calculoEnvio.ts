export const CONFIG_ENVIO = {
  COSTO_ESTANDAR: 150,      // Precio estándar de tu guía prepagada ($150 MXN)
  UMBRAL_ENVIO_GRATIS: 1500, // Compra mínima para envío gratis ($1,500 MXN)
};

export function calcularEnvio(subtotal: number): number {
  if (subtotal === 0) return 0;
  if (subtotal >= CONFIG_ENVIO.UMBRAL_ENVIO_GRATIS) return 0;
  
  return CONFIG_ENVIO.COSTO_ESTANDAR;
}