"use client";

import { useState } from "react";
import { Mark } from "@/components/trainer/Mark";
import { BrandPanel } from "./auth-screen/components/BrandPanel";
import { LoginFlow } from "./auth-screen/login/LoginFlow";
import { RegistrationFlow } from "./auth-screen/register/RegistrationFlow";

type Mode = "login" | "register";

type Props = { onAuth: () => void };

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="flex min-h-full w-full flex-col lg:h-full lg:flex-row">
      <BrandPanel />
      <div className="flex items-center gap-3 px-8 pt-8 lg:hidden">
        <Mark size={36} />
        <span className="font-display text-[22px] tracking-[2px] text-text">MOBVEX</span>
      </div>
      {mode === "login" ? (
        <LoginFlow onSuccess={onAuth} onSwitchToRegister={() => setMode("register")} />
      ) : (
        <RegistrationFlow onSuccess={onAuth} onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}
