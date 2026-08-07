"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function ZoomableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className || ""} cursor-pointer transition-transform hover:scale-105`}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
          
          <img 
            src={src} 
            alt={alt} 
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
