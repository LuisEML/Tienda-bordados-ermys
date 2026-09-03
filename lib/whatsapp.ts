export function generarEnlaceWhatsApp(
  telefono: string,
  nombreCliente: string,
  ordenId: string | number,
  tipoMensaje: "confirmacion" | "envio" = "confirmacion",
  numeroRastreo?: string,
  paqueteria?: string
) {
  // Limpiamos cualquier carácter no numérico del teléfono
  const numeroLimpio = telefono.replace(/\D/g, "");
  
  // Agregamos la lada internacional de México (52) si tiene 10 dígitos
  const telefonoCompleto = numeroLimpio.length === 10 ? `52${numeroLimpio}` : numeroLimpio;

  let texto = "";

  if (tipoMensaje === "confirmacion") {
    texto = `Hola ${nombreCliente}, ¡gracias por tu compra! Te confirmamos que recibimos tu pedido con la Orden #${ordenId}. Estamos preparando tu paquete.`;
  } else if (tipoMensaje === "envio") {
    texto = `Hola ${nombreCliente}, ¡tu pedido #${ordenId} va en camino! 🚚\nPaquetería: ${paqueteria || "Por confirmar"}\nNúmero de guía: ${numeroRastreo || "Por confirmar"}`;
  }

  // Codificamos el texto para que sea compatible con URLs
  return `https://wa.me/${telefonoCompleto}?text=${encodeURIComponent(texto)}`;
}