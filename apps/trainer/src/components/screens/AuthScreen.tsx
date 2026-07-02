/* Mobvex Trainer — Auth (login + register). Full-screen split layout. */
"use client";

import { useState } from "react";
import { Mark } from "@/components/trainer/Mark";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

type Props = {
  onAuth: () => void;
};

const STATS: Array<[string, string]> = [
  ["120+", "alumnos activos"],
  ["18 k", "sesiones guiadas"],
  ["96 %", "adherencia media"],
];

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("carlos@mobvex.app");
  const [pw, setPw] = useState("");

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      {/* Left — brand panel */}
      <div className="relative flex flex-col overflow-hidden border-b border-border bg-surface px-8 py-10 lg:w-[46%] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-[52px] lg:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, rgba(200,255,0,0.06), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <Mark size={40} />
          <span className="font-display text-[28px] tracking-[2px] text-text">
            MOBVEX
          </span>
        </div>

        <div className="relative my-10 lg:my-auto">
          <div className="mb-5 font-body text-[12px] uppercase tracking-[2px] text-accent">
            Panel del entrenador
          </div>
          <h2 className="m-0 font-display text-[38px] leading-[1.06] tracking-[0.5px] text-text lg:text-[50px]">
            Entrena a tu equipo, sin fricción.
          </h2>
          <p className="mt-6 max-w-[40ch] font-body text-[15px] leading-[1.6] text-muted">
            Gestiona a tus alumnos, sigue su progreso y asigna rutinas y dietas
            — todo desde un mismo lugar.
          </p>
        </div>

        <div className="relative flex gap-7">
          {STATS.map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-[30px] leading-none text-accent">
                {n}
              </div>
              <div className="mt-1 font-body text-[12px] text-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-10">
        <div className="flex w-full max-w-[380px] flex-col gap-[22px]">
          <div>
            <Text variant="title" as="h1">
              {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
            </Text>
            <div className="mt-2 font-body text-[14px] text-muted">
              {isLogin
                ? "Accede a tu panel de entrenamiento."
                : "Empieza a entrenar a tus alumnos en minutos."}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {!isLogin && (
              <Input
                label="Nombre completo"
                placeholder="Carlos Vega"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="Correo"
              type="email"
              placeholder="tú@mobvex.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {isLogin && (
              <button
                type="button"
                className="cursor-pointer self-end border-none bg-transparent p-0 font-body text-[13px] text-accent"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          <Button variant="primary" fullWidth onClick={onAuth}>
            {isLogin ? "Entrar" : "Crear cuenta"}
          </Button>

          <Divider label="o" />

          {/* <Button
            variant="secondary"
            fullWidth
            onClick={onAuth}
            className="whitespace-nowrap"
          >
            Continuar con Apple
          </Button> */}

          <div className="text-center font-body text-[14px] text-muted">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              type="button"
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="cursor-pointer border-none bg-transparent p-0 font-body text-[14px] font-medium text-accent"
            >
              {isLogin ? "Crea una" : "Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
