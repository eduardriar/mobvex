"use client";

import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { DietsScreen } from "@/components/screens/DietsScreen";
import { COPY } from "@/lib/copy";

export default function DietsPage() {
  const { open } = useSidebarMenu();

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.diets.title}
        subtitle={COPY.diets.subtitle}
      />
      <DietsScreen />
    </>
  );
}
