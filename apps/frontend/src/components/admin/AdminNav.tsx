"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { 
  LayoutDashboard, 
  Settings, 
  Pill, 
  FlaskConical, 
  Box, 
  Stethoscope, 
  CalendarHeart, 
  ImageIcon, 
  Megaphone, 
  MessageCircle, 
  FileText,
  Store,
  Inbox
} from "lucide-react";

const GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Store Management",
    items: [
      { href: "/orders", label: "Medicine Inbox", icon: Inbox },
      { href: "/package-orders", label: "Package Inbox", icon: Inbox },
      { href: "/my-orders", label: "My Store Orders", icon: Store },
    ]
  },
  {
    title: "Catalog",
    items: [
      { href: "/medicines", label: "Medicines", icon: Pill },
      { href: "/rates", label: "Lab Tests", icon: FlaskConical },
      { href: "/packages", label: "Health Packages", icon: Box },
      { href: "/doctors", label: "Doctors", icon: Stethoscope },
    ]
  },
  {
    title: "Content & Marketing",
    items: [
      { href: "/bulletins", label: "Bulletins", icon: Megaphone },
      { href: "/camp", label: "Sunday Camp", icon: CalendarHeart },
      { href: "/announcements", label: "Announcements", icon: Megaphone },
      { href: "/gallery", label: "Photo Gallery", icon: ImageIcon },
    ]
  },
  {
    title: "Inbox & System",
    items: [
      { href: "/feedbacks", label: "Feedbacks", icon: MessageCircle },
      { href: "/careers", label: "Job Applications", icon: FileText },
      { href: "/settings", label: "Settings", icon: Settings },
    ]
  }
];

export default function AdminNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  return (
    <nav className="flex flex-col h-full bg-surface border-r border-line overflow-y-auto">
      <div className="p-4 md:p-6 pb-2">
        <Link href={base} className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
          <span className="bg-primary text-white p-1 rounded-md">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          Admin Panel
        </Link>
      </div>

      <div className="px-3 py-4 flex-1 space-y-6">
        {GROUPS.map((group, i) => (
          <div key={i}>
            <h4 className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const target = `${base}${href}`;
                const active = href === "" ? pathname === base : pathname.startsWith(target);
                
                return (
                  <Link
                    key={label}
                    href={target}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted"}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
