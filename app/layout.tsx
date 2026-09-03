import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Metadata } from 'next';
import { Toaster } from "sonner";
import BotonWhatsApp from "@/app/components/BotonWhatsApp";
import ClientLayout from "./components/ClientLayout";


export const metadata: Metadata = {
  metadataBase: new URL("https://tu-dominio-oficial.com"), // Sustituir por el dominio final
  title: {
    default: "Confecciones y Bordados ERMY’S | Moda Artesanal Hecha a Mano",
    template: "%s | Confecciones y Bordados ERMY’S",
  },
  description:
    "Moda y ropa artesanal confeccionada a mano desde San Gabriel Chilac, Puebla. Diseños exclusivos, bordados tradicionales y piezas únicas de alta calidad.",
  keywords: [
    "bordados artesanales",
    "ropa mexicana artesanal",
    "San Gabriel Chilac",
    "vestidos bordados",
    "moda sustentable",
    "ERMY'S",
  ],
  authors: [{ name: "Confecciones y Bordados ERMY’S" }],
  creator: "Confecciones y Bordados ERMY’S",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://tu-dominio-oficial.com",
    title: "Confecciones y Bordados ERMY’S",
    description:
      "Guardianes de la tradición textil. Ropa artesanal con bordados hechos a mano y calidad premium.",
    siteName: "Confecciones y Bordados ERMY’S",
    images: [
      {
        url: "/og-image.jpg", // Imagen promocional en tu carpeta public/ (1200x630px recomendado)
        width: 1200,
        height: 630,
        alt: "Confecciones y Bordados ERMY’S - San Gabriel Chilac",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Confecciones y Bordados ERMY’S",
    description: "Moda artesanal mexicana hecha a mano.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} antialiased font-sans bg-crema`} suppressHydrationWarning={true}>
        <CartProvider>
          <ClientLayout>
            {children}
          </ClientLayout>

          <BotonWhatsApp />     
          <Toaster 
            position="top-right" 
            richColors 
            expand={true}
            toastOptions={{
              style: { background: '#f5f5f4', border: '1px solid #e7e5e4' },
              className: "font-sans"
            }}
          />     
        </CartProvider> 
      </body>
    </html>
  );
}