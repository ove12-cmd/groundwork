"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

const NAV_ROUTES = ["/today", "/plan", "/metrics", "/profile"];

export default function ConditionalNav() {
  const pathname = usePathname();
  const show =
    NAV_ROUTES.includes(pathname) ||
    pathname.startsWith("/plan/");
  return show ? <BottomNav /> : null;
}
