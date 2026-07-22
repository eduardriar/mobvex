import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function FormShell({ children }: Props) {
  return (
    <div className="flex w-full items-center justify-center p-10 lg:flex-1 lg:overflow-y-auto">
      <div className="flex w-full max-w-[380px] flex-col gap-[22px]">{children}</div>
    </div>
  );
}
