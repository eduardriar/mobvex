"use client";

import { useEffect, useRef, useState } from "react";
import {
  EMAIL_ALREADY_REGISTERED,
  registerTrainer,
  resendSignUpCode,
  verifyTrainerEmail,
} from "@mobvex/db";
import { StepDots } from "./components/StepDots";
import { FormShell } from "../components/FormShell";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

const RESEND_SECONDS = 60;

type RegisterStep = 0 | 1 | 2;

type Props = {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

export function RegistrationFlow({ onSuccess, onSwitchToLogin }: Props) {
  const [step, setStep] = useState<RegisterStep>(0);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPw2, setRegPw2] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const detailsValid = regName.trim().length > 1 && /\S+@\S+\.\S+/.test(regEmail);
  const codeComplete = code.join("").length === 6;
  const pwValid = regPw.length >= 8 && regPw === regPw2;
  const pwMismatch = regPw2.length > 0 && regPw !== regPw2;

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const onCodeKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const goToStep = (next: RegisterStep) => {
    setError(null);
    setStep(next);
  };

  const handleSignUp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await registerTrainer(regName.trim(), regEmail.trim(), regPw);
      if (err) {
        setError(
          err.message === EMAIL_ALREADY_REGISTERED
            ? "Este correo ya está registrado. Inicia sesión con tu cuenta."
            : err.message,
        );
        return;
      }
      setCode(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await verifyTrainerEmail(regEmail.trim(), code.join(""));
      if (err) { setError("Código inválido o expirado. Inténtalo de nuevo."); return; }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    const { error: err } = await resendSignUpCode(regEmail.trim());
    if (err) { setError(err.message); return; }
    setResendIn(RESEND_SECONDS);
  };

  /* ── step 0 — datos ───────────────────────────────── */
  if (step === 0) {
    return (
      <FormShell>
        <StepDots step={0} total={3} />
        <div>
          <Text variant="title" as="h1">Crea tu cuenta</Text>
          <p className="mt-2 font-body text-[14px] text-muted">
            Empieza con tu nombre y correo.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Input
            label="Nombre completo"
            placeholder="Carlos Vega"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
          />
          <Input
            label="Correo"
            type="email"
            placeholder="tú@mobvex.app"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
        </div>

        <Button variant="primary" fullWidth disabled={!detailsValid} onClick={() => goToStep(1)}>
          Continuar
        </Button>

        <p className="text-center font-body text-[14px] text-muted">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="cursor-pointer border-none bg-transparent p-0 font-body text-[14px] font-medium text-accent"
          >
            Inicia sesión
          </button>
        </p>
      </FormShell>
    );
  }

  /* ── step 1 — contraseña ──────────────────────────── */
  if (step === 1) {
    return (
      <FormShell>
        <StepDots step={1} total={3} />
        <div>
          <Text variant="title" as="h1">Crea tu contraseña</Text>
          <p className="mt-2 font-body text-[14px] text-muted">Mínimo 8 caracteres.</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={regPw}
            onChange={(e) => setRegPw(e.target.value)}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            value={regPw2}
            onChange={(e) => setRegPw2(e.target.value)}
          />
          {pwMismatch && (
            <span className="font-body text-[12px] text-accent-2">
              Las contraseñas no coinciden.
            </span>
          )}
        </div>

        {error && <Text variant="hint">{error}</Text>}

        <Button
          variant="primary"
          fullWidth
          disabled={!pwValid || submitting}
          onClick={handleSignUp}
        >
          {submitting ? "Enviando código..." : "Crear cuenta"}
        </Button>

        <button
          type="button"
          onClick={() => goToStep(0)}
          className="flex cursor-pointer items-center gap-1.5 self-center border-none bg-transparent p-0 font-body text-[13px] text-muted"
        >
          <Icon name="arrowLeft" size={14} />
          Volver
        </button>
      </FormShell>
    );
  }

  /* ── step 2 — verificar código ────────────────────── */
  return (
    <FormShell>
      <StepDots step={2} total={3} />
      <div>
        <Text variant="title" as="h1">Verifica tu correo</Text>
        <p className="mt-2 font-body text-[14px] leading-[1.5] text-muted">
          Enviamos un código de 6 dígitos a{" "}
          <span className="text-text">{regEmail || "tu correo"}</span>.
        </p>
      </div>

      <div className="flex justify-between gap-2.5">
        {code.map((d, i) => (
          <input
            key={i}
            ref={(el) => { codeRefs.current[i] = el; }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onCodeKeyDown(i, e)}
            className="h-14 w-12 rounded-input bg-surface-2 text-center font-display text-[26px] text-text outline-none transition-colors"
            style={{
              border: `1px solid ${d ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          />
        ))}
      </div>

      {error && <Text variant="hint">{error}</Text>}

      <Button
        variant="primary"
        fullWidth
        disabled={!codeComplete || submitting}
        onClick={handleVerify}
      >
        {submitting ? "Verificando..." : "Verificar"}
      </Button>

      <p className="text-center font-body text-[14px] text-muted">
        ¿No recibiste el código?{" "}
        {resendIn > 0 ? (
          <span className="font-body text-[14px] text-muted">
            Reenviar en {resendIn}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="cursor-pointer border-none bg-transparent p-0 font-body text-[14px] font-medium text-accent"
          >
            Reenviar
          </button>
        )}
      </p>

      <button
        type="button"
        onClick={() => goToStep(0)}
        className="flex cursor-pointer items-center gap-1.5 self-center border-none bg-transparent p-0 font-body text-[13px] text-muted"
      >
        <Icon name="arrowLeft" size={14} />
        Cambiar correo
      </button>
    </FormShell>
  );
}
