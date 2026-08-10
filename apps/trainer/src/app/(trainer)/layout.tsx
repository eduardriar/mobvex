/* Mobvex Trainer — shell for every authenticated trainer route: auth gate,
   Sidebar, and the mobile-drawer state each page's Topbar can open via
   SidebarMenuContext. */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, logout, subscribeToAuthChanges } from "@mobvex/db";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Sidebar } from "@/components/trainer/Sidebar";
import { SidebarMenuProvider } from "@/components/trainer/SidebarMenuContext";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });

    return subscribeToAuthChanges(async (_event, session) => {
      setAuthed(!!session);
    });
  }, []);

  // Close the mobile drawer on any route change, not just Sidebar-nav clicks
  // (a Topbar action like "Editar rutina" wouldn't otherwise close it).
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return <LoadingIndicator className="h-screen w-screen bg-bg" />;
  }

  if (!authed) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-bg">
        <AuthScreen onAuth={() => {}} />
      </div>
    );
  }

  const nav = pathname.startsWith("/exercises")
    ? "exercises"
    : pathname.startsWith("/diets")
      ? "diets"
      : "roster";

  return (
    <SidebarMenuProvider onOpen={() => setSidebarOpen(true)}>
      <div className="flex h-screen w-screen bg-bg">
        <Sidebar
          nav={nav}
          onNav={(n) => {
            // "settings" has no route yet — pre-existing dead click, matches
            // today's behavior (see Sidebar's NavKey vs. what onNav handles).
            if (n === "roster") router.push("/");
            if (n === "exercises") router.push("/exercises");
            if (n === "diets") router.push("/diets");
            setSidebarOpen(false);
          }}
          onLogout={async () => {
            await logout();
          }}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex h-full min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </SidebarMenuProvider>
  );
}
