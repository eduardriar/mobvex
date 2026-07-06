"use client";

import { useState } from "react";
import { BrandPanel } from "./auth-screen/components/BrandPanel";
import { LoginFlow } from "./auth-screen/login/LoginFlow";
import { RegistrationFlow } from "./auth-screen/register/RegistrationFlow";

type Mode = "login" | "register";

type Props = { onAuth: () => void };

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <BrandPanel />
      {mode === "login" ? (
        <LoginFlow onSuccess={onAuth} onSwitchToRegister={() => setMode("register")} />
      ) : (
        <RegistrationFlow onSuccess={onAuth} onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}
