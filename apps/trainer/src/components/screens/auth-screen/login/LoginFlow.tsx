"use client";

import { useState } from "react";
import { loginTrainer } from "@mobvex/db";
import { FormShell } from "../components/FormShell";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

type Props = {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
};

export function LoginFlow({ onSuccess, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    if (!pw) { setError("Ingresa tu contraseña."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await loginTrainer(email, pw);
      if (err) { setError(err.message); return; }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormShell>
      <div>
        <Text variant="title" as="h1">Inicia sesión</Text>
        <p className="mt-2 font-body text-[14px] text-muted">
          Accede a tu panel de entrenamiento.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
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
        <button
          type="button"
          className="cursor-pointer self-end border-none bg-transparent p-0 font-body text-[13px] text-accent"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && (
        <Text variant="hint">{error}</Text>
      )}

      <Button variant="primary" fullWidth disabled={submitting} onClick={handleLogin}>
        {submitting ? "Entrando..." : "Entrar"}
      </Button>

      <Divider label="o" />

      <Button variant="secondary" fullWidth>
        Continuar con Apple
      </Button>

      <p className="text-center font-body text-[14px] text-muted">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="cursor-pointer border-none bg-transparent p-0 font-body text-[14px] font-medium text-accent"
        >
          Crea una
        </button>
      </p>
    </FormShell>
  );
}
