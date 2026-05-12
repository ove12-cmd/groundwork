import type { HabitIcon } from "@/lib/mock-data";

export const HABIT_ICON_OPTIONS: HabitIcon[] = [
  "breath", "heart", "walk", "wind", "sun", "moon", "book", "star",
];

const p = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HabitIconSvg({ icon, size = 16 }: { icon: HabitIcon; size?: number }) {
  const v = { width: size, height: size, viewBox: "0 0 24 24", ...p };
  switch (icon) {
    case "breath": return <svg {...v}><path d="M12 22V12"/><path d="M12 12C7 10 4 6 5 2c4 0 9 3 7 10z"/><path d="M12 12C17 10 20 6 19 2c-4 0-9 3-7 10z"/></svg>;
    case "phone":  return <svg {...v}><rect x="5" y="2" width="14" height="20" rx="2.5"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>;
    case "heart":  return <svg {...v}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "walk":   return <svg {...v}><circle cx="12" cy="4" r="1.5" fill="currentColor"/><path d="M9 8.5l-2 5 3 2-1 4.5"/><path d="M15 8.5l2 5-3 2 1 4.5"/><line x1="7.5" y1="13" x2="16.5" y2="13"/></svg>;
    case "wind":   return <svg {...v}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>;
    case "sun":    return <svg {...v}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
    case "moon":   return <svg {...v}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
    case "book":   return <svg {...v}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case "star":   return <svg {...v}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "drop":   return <svg {...v}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
    default:       return <svg {...v}><circle cx="12" cy="12" r="5"/></svg>;
  }
}
