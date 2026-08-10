"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Topbar } from "@/components/trainer/Topbar";
import { useSidebarMenu } from "@/components/trainer/SidebarMenuContext";
import { RosterScreen } from "@/components/screens/RosterScreen";
import { COPY } from "@/lib/copy";

export default function RosterPage() {
  const router = useRouter();
  const { open } = useSidebarMenu();
  const [search, setSearch] = useState("");

  return (
    <>
      <Topbar
        onMenu={open}
        title={COPY.roster.title}
        subtitle={COPY.roster.subtitle}
        search={search}
        onSearch={setSearch}
        actions={
          <Button
            variant="primary"
            onClick={() => router.push("/students/new")}
            leadingIcon={<Icon name="plus" size={18} color="#0A0A0B" />}
          >
            {COPY.roster.newStudent}
          </Button>
        }
      />
      <RosterScreen
        search={search}
        onOpenStudent={(id) => router.push(`/students/${id}`)}
      />
    </>
  );
}
