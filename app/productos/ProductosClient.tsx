// "use client";

// // Importamos los componentes necesarios de Framer Motion
// import { useState } from "react";
// import Image from "next/image";
// import {motion, AnimatePresence} from "framer-motion"
// import Link from 'next/link';

// interface Producto{
//   id: number;
//   nombre: string;
//   precio: number;
//   categoria: string;
//   imagen_url: string;
// }

// export default function ProductosClient({ productosIniciales}:{ productosIniciales: Producto[]}) {
//   // Guardamos el texto que el usuario escribe en la búsqueda
//   const [busqueda, setBusqueda] = useState("");
//   // Guardamos la categoría seleccionada (por defecto 'Todos')
//   const [categoriaActiva, setCategoriaActiva] = useState("Todos");


  
//     // --- LÓGICA DE BÚSQUEDA Y FILTRADO COMBINADA ---
//     // Usamos ?. y || [] para evitar que el código truene si productosIniciales es null
//     const productosFiltrados = (productosIniciales || []).filter((p) => {
//         const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
//         const coincideCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
        
//         return coincideBusqueda && coincideCategoria;
//     });

//   // Lista de categorías disponibles para los botones de filtro
//   const categorias = ["Todos", "Huipiles", "Cojines", "Bolsas", "Mantelería"];

//   return (
//     <main className="min-h-screen bg-crema py-16 px-6 md:px-20">
//       <div className="max-w-7xl mx-auto">
//         {/* Cabecera del Catálogo */}
//         <header className="text-center mb-16">
//           <h1 className="font-serif text-5xl text-tierra italic mb-6">Nuestra Colección</h1>
//           <p className="text-stone-500 max-w-lg mx-auto">Piezas únicas bordadas con historias y tradiciones de nuestra tierra.</p>
//         </header>

//         {/* BARRA DE BÚSQUEDA Y FILTROS */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-stone-200 pb-8">
//           <input 
//             type="text"
//             placeholder="Buscar bordado..."
//             className="bg-transparent border-b border-tierra/30 py-2 px-4 focus:outline-none focus:border-tierra w-full md:w-64 text-sm italic"
//             // Actualizamos el estado 'busqueda' al escribir
//             onChange={(e) => setBusqueda(e.target.value)}
//           />
          
//           {/* Contenedor de botones de categoría (con scroll horizontal en móvil) */}
//           <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
//             {categorias.map((cat) => (
//               <button
//                 key={cat}
//                 // Al hacer clic, actualizamos la 'categoriaActiva'
//                 onClick={() => setCategoriaActiva(cat)}
//                 className={`text-[9px] uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
//                   categoriaActiva === cat 
//                   ? "bg-tierra text-crema shadow-md" 
//                   : "bg-stone-100 text-stone-500 hover:bg-stone-200"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>


//           {/* --- GRILLA DE PRODUCTOS CON ANIMACIONES --- */}        {productosFiltrados.length > 0 ? (
//           // Usamos 'motion.div' para el contenedor de la grilla
//           <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
//             {/* AnimatePresence permite animar elementos al salir (exit) */}
//             <AnimatePresence>
//                 {productosFiltrados.map((producto) => (
//                 <Link href={`/productos/${producto.id}`} 
//                       key={producto.id} 
//                       className="block">

//                 <motion.div 
//                     layout // Importante para que los elementos se reacomoden suavemente
//                     // Definimos los estados de la animación:
//                     initial={{ opacity: 0, scale: 0.9 }} // Estado al aparecer (invisible y pequeño)
//                     animate={{ opacity: 1, scale: 1 }}    // Estado final (visible y tamaño normal)
//                     exit={{ opacity: 0, scale: 0.8 }}     // Estado al desaparecer (se desvanece y achica)
//                     // Configuración de la transición
//                     transition={{ 
//                         duration: 0.4, // Tiempo de la animación
//                         ease: "easeInOut" // Tipo de curva de aceleración
//                     }}
//                     className="h-full" // Aseguramos que ocupe el alto de la celda de la grilla
//                     >
//                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 rounded-sm mb-4">
//                   <Image
//                     src={producto.imagen_url || "/placeholder.jpg"}
//                     alt={producto.nombre}
//                     fill
//                     className="object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                 </div>
//                 <h3 className="font-serif text-xl italic text-tierra">{producto.nombre}</h3>
//                 <p className="text-stone-400 text-sm mt-1">${producto.precio} MXN</p> 
//                 </motion.div>
//                 </Link>

//                 ))}
//             </AnimatePresence>
//           </motion.div>
//         ) : (
//           // Mensaje si no hay resultados
//           <motion.div
//             initial={{opacity:0}}
//             animate={{opacity:1}}
//             className="text-center py-20">
//             <p className="text-stone-400 italic">No encontramos bordados que coincidan con tu búsqueda.</p>
//           </motion.div>
//         )}
//       </div>
//     </main>
//   );
// }