import { announcementMessage } from "@/lib/constants";

export function AnnouncementBar() {
  return <div className="border-b border-white/10 bg-black px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-300">{announcementMessage}</div>;
}
