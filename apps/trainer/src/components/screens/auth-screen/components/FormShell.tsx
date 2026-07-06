import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function FormShell({ children }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-10">
      <div className="flex w-full max-w-[380px] flex-col gap-[22px]">{children}</div>
    </div>
  );
}
