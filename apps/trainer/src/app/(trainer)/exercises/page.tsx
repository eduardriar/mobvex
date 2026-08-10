"use client";

import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { ExercisesScreen } from "@/components/screens/ExercisesScreen";
import { COPY } from "@/lib/copy";

export default function ExercisesPage() {
  const { open } = useSidebarMenu();

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.exercises.title}
        subtitle={COPY.exercises.subtitle}
      />
      <ExercisesScreen />
    </>
  );
}
