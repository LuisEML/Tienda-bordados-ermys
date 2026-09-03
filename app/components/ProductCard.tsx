// import Link from 'next/link'; // Importamos Link para navegación rápida
// import BotonCarrito from './BotonCarrito';1. //Importamos el componente que ya creamos
// import { Producto } from '@/data/productos';



// // 1. Definimos que el componente DEBE recibir un id
// interface ProductProps {
//   producto: Producto; // Ahora recibimos el objeto completo por limpieza
// }

// // ... (dentro del componente ProductCard) ...
// // Cambiamos el contenedor <div> por un <Link>


// export default function ProductCard({producto}: ProductProps) {

//   return (
//     <div className='group flex flex-col h-full'>
//       <Link href={`/producto/${producto.id}`} className="cursor-pointer flex-grow">
//         {/* Contenedor de Imagen */}
//         <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm mb-4">
//           <img
//             src={producto.imagenes[0]}
//             alt={producto.nombre}
//             className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
//           />
//           <div className='absolute top-2 left-2 bg-crema/90 px-2 py-1 text-[8px] uppercase tracking-widest text-tierra'>
//               {producto.categoria}
//           </div>
//         </div>
//         <div className="mb-4">
//           <h3 className="text-sm font-serif italic text-stone-800">{producto.nombre}</h3>
//           <p className="text-sm font-sans font-bold text-artesano">${producto.precio} MXN</p>
//         </div>
//       </Link>

//         {/* Botón rápido al hacer hover */}
//         <div className="mt-auto">
//             <BotonCarrito producto={producto}/>
//         </div>

//     </div>
//   );
// }