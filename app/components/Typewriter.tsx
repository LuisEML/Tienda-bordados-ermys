"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  speed?: number; // Velocidad entre cada letra en ms
  delay?: number; // Retraso antes de iniciar la animación
  className?: string;
  showCursor?: boolean;
}

export function Typewriter({
  text,
  speed = 70,
  delay = 200,
  className = "",
  showCursor = true,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Retraso inicial opcional antes de empezar a escribir
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isStarted]);

  return (
    <span className={`whitespace-pre-line ${className}`}>
      {displayedText}
      {showCursor && (
        <span className="inline-block w-[2px] h-[0.8em] bg-current ml-1 animate-pulse align-middle" />
      )}
    </span>
  );
}