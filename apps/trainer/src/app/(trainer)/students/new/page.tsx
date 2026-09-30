"use client";

import { useRouter } from "next/navigation";
import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { NewStudentScreen } from "@/components/screens/NewStudentScreen";
import { COPY } from "@/lib/copy";

export default function NewStudentPage() {
  const router = useRouter();
  const { open } = useSidebarMenu();

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.newStudent.title}
        subtitle={COPY.newStudent.subtitle}
        onBack={() => router.push("/")}
      />
      <NewStudentScreen
        onDone={(id) => router.push(`/students/${id}`)}
        onCancel={() => router.push("/")}
      />
    </>
  );
}
