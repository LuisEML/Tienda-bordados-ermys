"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const esRutaAdmin = pathname.startsWith("/admin");

  return (
    <>
      {/* Muestra Navbar solo fuera de /admin */}
      {!esRutaAdmin && <Navbar />}

      {/* Contenido dinámico de las páginas */}
      <main>{children}</main>

      {/* Muestra Footer solo fuera de /admin */}
      {!esRutaAdmin && <Footer />}
    </>
  );
}