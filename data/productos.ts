// // Definimos cómo debe ser un producto de Bordados Ermy
// export interface Producto {
//   id: string;
//   nombre: string;
//   precio: number;
//   categoria: string;
//   imagenes: string[]; // <-- AHORA ES UN ARRAY DE TEXTOS (URLs)
//   descripcion: string;
// }

// // Nuestra "base de datos" temporal
// export const PRODUCTOS_ERMY: Producto[] = [
//   {
//     id: "huipil-flores", // Este ID se usará en la URL: /producto/huipil-flores
//     nombre: "Huipil Gala Flores",
//     precio: 1250,
//     categoria: "Huipiles",
//     imagenes:[ 
//       "https://cdn.pixabay.com/photo/2012/04/26/22/31/fabric-43354_1280.jpg", // Foto principal (frente)
//       "https://cdn.pixabay.com/photo/2012/04/26/22/31/fabric-43354_1280.jpg", // Detalle del bordado (zoom)
//       "https://cdn.pixabay.com/photo/2012/04/26/22/31/fabric-43354_1280.jpg"  // Foto del reverso o puesta
//     ],
//       descripcion: "Esta pieza única ha sido bordada a mano durante 3 semanas por artesanas de la región. Utiliza hilos de seda natural y técnicas ancestrales de punto de cruz."
//   },
//   {
//     id: "cojin-oaxaca",
//     nombre: "Cojín Oaxaqueño",
//     precio: 450,
//     categoria: "Cojines",
//     imagenes: [
//       "https://picsum.photos/seed/bordado1/800/1000", // Foto principal
//       "https://picsum.photos/seed/detalle1/800/1000",  // Detalle
//       "https://picsum.photos/seed/tela1/800/1000"      // Textura
//     ],
//     descripcion: "Decoración artesanal que aporta calidez y color a cualquier espacio. Bordado resistente y de alta calidad."
//   },
//   {
//     id: "nueva-prenda",
//     nombre: "textil",
//     precio: 500,
//     categoria: "Bolsas",
//     imagenes: [
//       "https://picsum.photos/seed/hogar1/800/1000",
//       "https://picsum.photos/seed/textura2/800/1000",
//       "https://picsum.photos/seed/artesania2/800/1000"
//     ],
//     descripcion: "nueva prenda del año"
//   }

// ];