// "use client";

// import { useCart } from "@/context/CartContext";
// import Link from "next/link";
// import Image from "next/image";
// import { loadStripe } from "@stripe/stripe-js";

// // Reemplaza esto con tu llave pública de Stripe real (deja esta para testear)
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// export default function CarritoPage() {
//   const { items, total } = useCart();

//   // 1. Cálculo del subtotal
//   const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

//   // 2. Función para Stripe (revisada)
//  // app/carrito/page.tsx

// const handleCheckout = () => {
//   // Cerramos el cajón si está abierto
//   if (onClose) onClose(); 
//   // Redirigimos directo a la nueva pantalla de datos y métodos de pago
//   window.location.href = "/checkout";
// };

//   // 3. Pantalla de Carrito Vacío
//   if (items.length === 0) {
//     return (
//       <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
//         <h1 className="font-serif text-4xl text-tierra mb-4 italic">Tu bolsa está vacía</h1>
//         <p className="text-stone-500 mb-8">Parece que aún no has elegido tu pieza artesanal.</p>
//         <Link href="/" className="bg-tierra text-crema px-8 py-3 rounded-full uppercase text-[10px] tracking-widest font-bold">
//           Volver a la tienda
//         </Link>
//       </main>
//     );
//   }

//   // 4. EL RETURN PRINCIPAL (Aquí estaba el error)
//   return (
//     <main className="min-h-screen bg-crema py-20 px-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="font-serif text-4xl text-tierra mb-12 italic border-b border-stone-200 pb-6">
//           Tu Bolsa de Compras ({total})
//         </h1>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//           {/* LISTA DE PRODUCTOS */}
//           <div className="lg:col-span-2 space-y-8">
//             {items.map((item) => (
//               <div key={item.id} className="flex gap-6 border-b border-stone-100 pb-8">
//                 <div className="relative w-24 h-32 flex-shrink-0">
//                   <Image 
//                     src={item.imagen_url} 
//                     alt={item.nombre} 
//                     fill 
//                     className="object-cover rounded-sm"
//                   />
//                 </div>
//                 <div className="flex flex-col justify-between py-1">
//                   <div>
//                     <h3 className="font-serif text-lg text-tierra">{item.nombre}</h3>
//                     <p className="text-xs text-stone-400 uppercase tracking-widest">{item.cantidad}</p>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <span className="text-sm font-sans">Cant: {item.cantidad}</span>
//                     <span className="font-bold text-sm">${item.precio * item.cantidad} MXN</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* RESUMEN DE PAGO */}
//           <div className="bg-white p-8 rounded-sm shadow-sm h-fit sticky top-28">
//             <h2 className="font-serif text-xl mb-6">Resumen</h2>
//             <div className="space-y-4 border-b border-stone-100 pb-6 mb-6">
//               <div className="flex justify-between text-sm">
//                 <span className="text-stone-500">Subtotal</span>
//                 <span>${subtotal} MXN</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-stone-500">Envío</span>
//                 <span className="text-green-600 font-medium italic">Gratis</span>
//               </div>
//             </div>
//             <div className="flex justify-between font-bold text-lg mb-8">
//               <span>Total</span>
//               <span>${subtotal} MXN</span>
//             </div>
//             <button 
//               onClick={handleCheckout}
//               className="w-full bg-stone-900 text-white py-4 rounded-full uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-artesano transition-colors"
//             >
//               Pagar con Stripe
//             </button>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }