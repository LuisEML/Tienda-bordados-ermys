"use client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  children: React.ReactNode;
  delay?: number; // Para animaciones escalonadas (stagger)
  className?: string;
}

export function RevealOnScroll({ children, delay = 0, className = "" }: Props) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95"
      } ${className}`}
    >
      {children}
    </div>
  );
}