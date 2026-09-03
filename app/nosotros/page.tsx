import NosotrosClient from "./NosotrosClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description: "Conoce a las manos detrás de los hilos. El legado y la tradición de Bordados Ermy en Oaxaca."
};

// 2. EXPORTACIÓN POR DEFECTO (Esto es lo que te falta)
// Debe ser una función que retorne el componente de cliente
export default function NosotrosPage() {
  return <NosotrosClient />;
}