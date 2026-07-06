/* Mobvex Trainer — student status pill. */
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/Icon";
import type { StudentStatus } from "@/lib/types";

type Props = {
  status: StudentStatus;
};

export function StatusPill({ status }: Props) {
  if (status === "attention") {
    return (
      <Badge tone="danger" leadingIcon={<Icon name="bell" size={13} />}>
        Atención
      </Badge>
    );
  }
  return (
    <Badge leadingIcon={<Icon name="check" size={13} />}>Al día</Badge>
  );
}
