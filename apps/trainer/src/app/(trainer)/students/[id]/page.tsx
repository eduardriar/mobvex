"use client";

import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { StudentScreen } from "@/components/screens/StudentScreen";
import { studentById } from "@/lib/data";
import { COPY } from "@/lib/copy";

export default function StudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { open } = useSidebarMenu();
  const student = studentById(id);

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.studentPage.title}
        subtitle={student?.name}
        onBack={() => router.push("/")}
      />
      <StudentScreen
        studentId={id}
        onEditRoutine={() => router.push(`/students/${id}/routine`)}
        onEditDiet={() => router.push(`/students/${id}/diet`)}
      />
    </>
  );
}
