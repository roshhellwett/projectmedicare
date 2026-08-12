import { getActiveAnnouncements } from "@/lib/db/announcements";
import { Megaphone } from "lucide-react";

export default async function AnnouncementBanner() {
  const announcements = await getActiveAnnouncements();

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-t border-green-900 bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white overflow-hidden relative shadow-inner">
      <div className="container relative z-10 flex items-center">
        {/* Static Icon on the left to indicate announcements */}
        <div className="flex h-12 shrink-0 items-center gap-2 bg-gradient-to-r from-green-900 to-green-800 pr-6 pl-2 font-bold uppercase tracking-wider text-green-100 shadow-[10px_0_20px_-10px_rgba(20,83,45,1)] z-20">
          <Megaphone className="h-5 w-5 animate-pulse text-green-300" />
          <span className="hidden sm:inline-block">Announcements</span>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="group relative flex-1 overflow-hidden h-12 flex items-center">
          <div className="flex w-max animate-marquee items-center gap-12 group-hover:[animation-play-state:paused]">
            {/* Duplicate the announcements list twice to create an infinite seamless loop */}
            {[...announcements, ...announcements].map((announcement, idx) => (
              <div
                key={`${announcement.id}-${idx}`}
                className="flex items-center gap-2 px-4 whitespace-nowrap"
              >
                <span className="font-extrabold text-green-100">
                  {announcement.title}:
                </span>
                <span className="text-sm font-medium text-green-50/90">
                  {announcement.description}
                </span>
                <span className="ml-8 inline-block h-1.5 w-1.5 rounded-full bg-green-400/50"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
