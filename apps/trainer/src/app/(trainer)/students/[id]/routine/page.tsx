"use client";

import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { RoutineBuilder } from "@/components/screens/RoutineBuilder";
import { studentById } from "@/lib/data";
import { COPY } from "@/lib/copy";

export default function StudentRoutinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { open } = useSidebarMenu();
  const student = studentById(id);

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.studentPage.routineTitle}
        subtitle={student ? `Para ${student.name}` : ""}
        onBack={() => router.push(`/students/${id}`)}
      />
      <RoutineBuilder studentId={id} />
    </>
  );
}
