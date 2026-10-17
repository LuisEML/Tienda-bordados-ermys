import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Metadata } from 'next';
import { Toaster } from "sonner";
import BotonWhatsApp from "@/app/components/BotonWhatsApp";
import ClientLayout from "./components/ClientLayout";
import { META_PIXEL_ID } from '@/lib/meta-pixel';
import Script from 'next/script'; // Importamos Script de Next.js

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ropatipicaermys.com.mx/"), // Sustituir por el dominio final
  title: {
    default: "Confecciones y Bordados ERMY’S | Ropa Típica y Moda Artesanal",
    template: "%s | Confecciones y Bordados ERMY’S",
  },
  description:
    "Tienda de ropa típica y vestidos bordados a mano en San Gabriel Chilac, Puebla. Compra blusas artesanales, guayaberas y moda mexicana de alta calidad.",
  keywords: [
    "ropa tipica mexicana",
    "ropa artesanal puebla",
    "ropa tipica poblana",
    "vestidos bordados a mano",
    "blusas tipicas bordadas",
    "guayaberas artesanales",
    "bordados artesanales",
    "ropa mexicana artesanal",
    "San Gabriel Chilac bordados",
    "Ropa tipica chilac",
    "vestidos bordados",
    "moda sustentable",
    "Confecciones ERMY'S",
    "ERMY'S",
  ],
  authors: [{ name: "Confecciones y Bordados ERMY’S" }],
  creator: "Confecciones y Bordados ERMY’S",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://www.ropatipicaermys.com.mx/",
    title: "Ropa Típica y Moda Artesanal Mexicana | ERMY’S",
    description:
      "Diseños exclusivos y ropa típica confeccionada a mano desde San Gabriel Chilac, Puebla. Envíos a todo México.",
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
    title: "Confecciones y Bordados ERMY’S | Ropa Típica Mexicana",
    description: "Moda artesanal mexicana confeccionada a mano en Puebla.",
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
        {/* Meta Pixel Code Corregido */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt="facebook-pixel"
          />
        </noscript>
        {/* End Meta Pixel Code */}

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
