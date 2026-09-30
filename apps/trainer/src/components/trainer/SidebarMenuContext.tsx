/* Mobvex Trainer — bridges a page's Topbar "menu" button to the Sidebar's
   mobile-drawer state, which lives one level up in the (trainer) layout (a
   layout can't pass callback props down into its page children). */
"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

type SidebarMenuValue = {
  open: () => void;
};

const SidebarMenuContext = createContext<SidebarMenuValue | null>(null);

type Props = {
  onOpen: () => void;
  children: ReactNode;
};

export function SidebarMenuProvider({ onOpen, children }: Props) {
  const value = useMemo<SidebarMenuValue>(() => ({ open: onOpen }), [onOpen]);
  return (
    <SidebarMenuContext.Provider value={value}>
      {children}
    </SidebarMenuContext.Provider>
  );
}

export function useSidebarMenu(): SidebarMenuValue {
  const ctx = useContext(SidebarMenuContext);
  if (!ctx) {
    throw new Error("useSidebarMenu must be used within a SidebarMenuProvider");
  }
  return ctx;
}
