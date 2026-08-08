"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { LayoutDashboard, Settings } from "lucide-react";

const ITEMS = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function AdminNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Admin sections"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const target = `${base}${href}`;
        const active =
          href === "" ? pathname === base : pathname.startsWith(target);
        return (
          <Link
            key={label}
            href={target}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
              active
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25"
                : "text-foreground/70 hover:bg-primary-soft hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
