"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import { createClient } from "@/lib/supabase/client";

const NAV_ROUTES = ["/today", "/plan", "/metrics", "/profile"];

export default function ConditionalNav() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onNavRoute = NAV_ROUTES.includes(pathname) || pathname.startsWith("/plan/");
  return onNavRoute && loggedIn ? <BottomNav /> : null;
}
