"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

export function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
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
      <div className={`relative ${className || ""}`} onClick={() => setIsOpen(true)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="cursor-pointer transition-transform hover:scale-105 object-cover"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="absolute right-4 top-4 z-[110] rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative h-[90vh] w-[90vw] max-w-5xl rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
