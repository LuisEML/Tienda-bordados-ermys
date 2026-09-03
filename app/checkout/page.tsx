"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { calcularEnvio, CONFIG_ENVIO } from "@/lib/calculoEnvio";

// 1. Componente interno renombrado a CheckoutContent
function CheckoutContent() {
  const { items, total: subtotalCarrito } = useCart();

  const subtotal = subtotalCarrito || 0;
  const costoEnvio = calcularEnvio(subtotal);
  const totalFinal = subtotal + costoEnvio;

  const faltaParaGratis = Math.max(0, CONFIG_ENVIO.UMBRAL_ENVIO_GRATIS - subtotal);
  
  const tieneProductosMayoreo = items.some((item: any) => {
    const minimoMayoreo = item.cantidad_minima_mayoreo || 12;
    return item.cantidad >= minimoMayoreo && Number(item.precio_mayoreo) > 0;
  });

  const searchParams = useSearchParams();
  const productoId = searchParams.get("id");

  const rutaRegreso = productoId ? `/productos/${productoId}` : "/productos";
  
  const [cargando, setCargando] = useState(false);
  
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    referencias: "",
    ciudad: "",
    codigoPostal: "",
    estado: "",
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [metodoPago, setMetodoPago] = useState("stripe");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length > 10) return;
      setForm({ ...form, [name]: soloNumeros });
    } else if (name === "codigoPostal") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length > 5) return;
      setForm({ ...form, [name]: soloNumeros });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    if (errores[name]) {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia[name];
        return copia;
      });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    const nombreLimpio = form.nombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = "El nombre completo es obligatorio.";
    } else if (nombreLimpio.split(" ").filter(Boolean).length < 2) {
      nuevosErrores.nombre = "Por favor, ingresa tu nombre y al menos un apellido.";
    }

    const telefonoLimpio = form.telefono.replace(/\s+/g, ""); 
    const regexTelefono = /^[0-9]{10}$/;
    if (!telefonoLimpio) {
      nuevosErrores.telefono = "El teléfono de contacto es obligatorio.";
    } else if (!regexTelefono.test(telefonoLimpio)) {
      nuevosErrores.telefono = "Ingresa un número válido a 10 dígitos (Ej. 5512345678).";
    }

    const cpLimpio = form.codigoPostal.trim();
    const regexCP = /^[0-9]{5}$/;
    if (!cpLimpio) {
      nuevosErrores.codigoPostal = "El código postal es obligatorio.";
    } else if (!regexCP.test(cpLimpio)) {
      nuevosErrores.codigoPostal = "El código postal debe tener exactamente 5 dígitos.";
    }

    if (!form.direccion.trim()) nuevosErrores.direccion = "La dirección de entrega es obligatoria.";
    if (!form.ciudad.trim()) nuevosErrores.ciudad = "La ciudad es obligatoria.";
    if (!form.estado.trim()) nuevosErrores.estado = "El estado es obligatorio.";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCargando(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items, 
          datosEnvio: form,
          metodoPago,
          costoEnvio
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Hubo un error al procesar tu orden.");
      }
    } catch (error) {
      console.error("Error en el checkout:", error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-tierra mb-4 italic">No hay productos en el checkout</h1>
        <Link href="/" className="bg-stone-900 text-white px-8 py-3 rounded-xl text-xs uppercase tracking-widest font-bold">
          Volver a la tienda
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/50 py-16 px-4 md:px-6">
      <div className="mb-8">
        <Link 
          href={rutaRegreso} 
          className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-stone-400 hover:text-stone-700 transition-colors cursor-pointer group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span> 
          Volver a la prenda
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        {/* COLUMNA IZQUIERDA: ENVÍO Y PAGO */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100 shadow-xs">
            <h2 className="font-serif text-xl text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Truck size={20} className="text-tierra" /> Datos de Envío
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Nombre Completo *</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.nombre ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="Ej. Juan Pérez" />
                {errores.nombre && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.nombre}</p>}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Teléfono de Contacto *</label>
                <input type="tel" name="telefono" maxLength={10} value={form.telefono} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.telefono ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="Ej. 5512345678" />
                {errores.telefono && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.telefono}</p>}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Código Postal *</label>
                <input type="text" name="codigoPostal" maxLength={5} value={form.codigoPostal} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.codigoPostal ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="Ej. 06000" />
                {errores.codigoPostal && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.codigoPostal}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Dirección (Calle, Número, Colonia) *</label>
                <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.direccion ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="Av. Juárez 123, Int 4, Col. Centro" />
                {errores.direccion && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.direccion}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">
                  Referencias del Domicilio <span className="text-stone-400 font-normal">(Opcional)</span>
                </label>
                <input 
                  type="text" 
                  name="referencias" 
                  value={form.referencias} 
                  onChange={handleChange} 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-tierra transition-colors" 
                  placeholder="Ej. Fachada color blanco, portón negro, entre calle Hidalgo y Juárez" 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Ciudad *</label>
                <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.ciudad ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="Ciudad de México" />
                {errores.ciudad && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.ciudad}</p>}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">Estado *</label>
                <input type="text" name="estado" value={form.estado} onChange={handleChange} className={`w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm focus:outline-none ${errores.estado ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-stone-200 focus:border-tierra'}`} placeholder="CDMX" />
                {errores.estado && <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ {errores.estado}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100 shadow-xs">
            <h2 className="font-serif text-xl text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-100 pb-3">
              <CreditCard size={20} className="text-tierra" /> Método de Pago
            </h2>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${metodoPago === "stripe" ? "border-stone-900 bg-stone-50/50" : "border-stone-200"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment_method" checked={metodoPago === "stripe"} onChange={() => setMetodoPago("stripe")} className="accent-stone-900 w-4 h-4" />
                  <div>
                    <span className="text-sm font-bold text-stone-800">Tarjeta de Crédito / Débito</span>
                    <p className="text-[11px] text-stone-400">Procesado de forma segura por Stripe</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/imgs/visa.svg" alt="Visa" className={`h-3.5 object-contain transition-all duration-300 ${metodoPago === "stripe" ? "grayscale-0 opacity-100" : "grayscale opacity-40"}`} />
                  <img src="/imgs/mastercard.svg" alt="Mastercard" className={`h-5 object-contain transition-all duration-300 ${metodoPago === "stripe" ? "grayscale-0 opacity-100" : "grayscale opacity-40"}`} />
                </div>
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${metodoPago === "mercadopago" ? "border-stone-900 bg-stone-50/50" : "border-stone-200"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment_method" checked={metodoPago === "mercadopago"} onChange={() => setMetodoPago("mercadopago")} className="accent-stone-900 w-4 h-4" />
                  <div>
                    <span className="text-sm font-bold text-stone-800">Mercado Pago</span>
                    <p className="text-[11px] text-stone-400">Tarjetas, efectivo (OXXO) o saldo Mercado Pago</p>
                  </div>
                </div>
                <img src="/imgs/Mercado_Pago.svg" alt="Mercado Pago" className={`h-7.5 md:h-8 object-contain transition-all duration-300 ${metodoPago === "mercadopago" ? "grayscale-0 opacity-100" : "grayscale opacity-40"}`} />
              </label>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xs h-fit sticky top-24 flex flex-col">
            <h2 className="font-serif text-xl text-stone-800 mb-4 flex items-center gap-2 pb-2 border-b border-stone-100">
              <ShoppingBag size={18} className="text-stone-600" /> Resumen de Bolsa
            </h2>

            <div className="flex-1 max-h-[280px] overflow-y-auto space-y-4 pr-1 mb-4">
              {items.map((item: any) => {
                const minimoMayoreo = item.cantidad_minima_mayoreo || 12;
                const esMayoreo = item.cantidad >= minimoMayoreo && Number(item.precio_mayoreo) > 0;
                const precioUnitario = esMayoreo ? item.precio_mayoreo : item.precio;

                return (
                  <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                    <div className="relative w-14 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imagen_url || item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-800 line-clamp-1">{item.nombre}</h4>
                        {esMayoreo && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                            ✨ Mayoreo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Talla: <strong className="text-stone-700">{item.talla}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Color: <strong className="text-stone-700">{item.color}</strong>
                        </span>
                        <span>•</span>
                        <span>Cant: <strong className="text-stone-700">{item.cantidad}</strong></span>
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-xs font-bold text-stone-900">
                          ${(precioUnitario * item.cantidad).toLocaleString("es-MX")} MXN
                        </p>
                        {esMayoreo && (
                          <span className="text-[10px] text-stone-400">
                            (${precioUnitario.toLocaleString("es-MX")} c/u)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 space-y-3">
              {tieneProductosMayoreo && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2.5 flex items-center gap-2 text-emerald-900 text-[11px] font-medium">
                  <span>✨</span>
                  <p className="leading-tight">
                    ¡Tu pedido includes <span className="font-bold">Tarifa de Mayoreo</span> aplicada!
                  </p>
                </div>
              )}

              {subtotal > 0 && (
                <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                  {costoEnvio === 0 ? (
                    <p className="text-emerald-700 font-bold text-center">
                      🎉 ¡Felicidades! Tienes Envío Gratis.
                    </p>
                  ) : (
                    <div>
                      <p className="text-stone-600 mb-1 text-[11px]">
                        Agrega <span className="font-bold text-stone-900">${faltaParaGratis.toLocaleString("es-MX")} MXN</span> más para <span className="font-bold text-emerald-700">Envío GRATIS</span>.
                      </p>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full transition-all duration-300"
                          style={{ width: `${Math.min((subtotal / CONFIG_ENVIO.UMBRAL_ENVIO_GRATIS) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">${subtotal.toLocaleString("es-MX")} MXN</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Envío</span>
                  <span className="font-semibold">
                    {costoEnvio === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Gratis
                      </span>
                    ) : (
                      `$${costoEnvio.toLocaleString("es-MX")} MXN`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-sm text-stone-900">
                  <span>Total</span>
                  <span>${totalFinal.toLocaleString("es-MX")} MXN</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-4 bg-stone-900 hover:bg-tierra text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] transition-all duration-300 disabled:bg-stone-300 shadow-md cursor-pointer"
            >
              {cargando ? "Procesando Orden..." : `Proceder al Pago con ${metodoPago === "stripe" ? "Stripe" : "Mercado Pago"}`}
            </button>
          </div>
        </div>

      </form>
    </main>
  );
}

// 2. Componente principal exportado por defecto envuelto en Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500 font-sans">Cargando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}