"use client";

import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { DietBuilder } from "@/components/screens/DietBuilder";
import { studentById } from "@/lib/data";
import { COPY } from "@/lib/copy";

export default function StudentDietPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { open } = useSidebarMenu();
  const student = studentById(id);

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.studentPage.dietTitle}
        subtitle={student ? `Para ${student.name}` : ""}
        onBack={() => router.push(`/students/${id}`)}
      />
      <DietBuilder studentId={id} />
    </>
  );
}
