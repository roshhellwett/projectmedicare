"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminNav from "./AdminNav";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-surface-muted"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-64 max-w-[80vw] bg-surface h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground bg-background/50 rounded-full z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <AdminNav />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
