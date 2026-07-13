/* Mobvex Trainer — sidebar (brand, nav, trainer footer). */
"use client";

import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import { Mark } from "./Mark";

type NavKey = "roster" | "exercises" | "diets" | "settings";

type NavItemProps = {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-input border px-3.5 py-[11px] text-left",
        "font-body text-[14px] font-medium tracking-[0.2px] transition-colors duration-150",
        active
          ? "bg-accent-card border-accent-card-border text-accent"
          : "border-transparent text-muted hover:text-text",
      )}
    >
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

type Props = {
  nav: NavKey;
  onNav: (n: NavKey) => void;
  onLogout: () => void;
};

export function Sidebar({ nav, onNav, onLogout }: Props) {
  const profile = useTrainerProfile();

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-[22px]">
      <div className="flex items-center gap-3 px-2.5 pb-[22px] pt-1">
        <Mark size={36} />
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-[24px] leading-none tracking-[2px] text-text">
            MOBVEX
          </span>
          <span className="font-body text-[10px] uppercase tracking-[2px] text-accent">
            Entrenador
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavItem
          icon="users"
          label="Alumnos"
          active={nav === "roster"}
          onClick={() => onNav("roster")}
        />
        <NavItem
          icon="dumbbell"
          label="Ejercicios"
          active={nav === "exercises"}
          onClick={() => onNav("exercises")}
        />
        <NavItem
          icon="utensils"
          label="Dietas"
          active={nav === "diets"}
          onClick={() => onNav("diets")}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <NavItem
          icon="settings"
          label="Ajustes"
          active={nav === "settings"}
          onClick={() => onNav("settings")}
        />
        <div className="mx-1 my-2.5 h-px bg-border" />
        <div className="flex items-center gap-3 px-2.5 py-1.5">
          <Avatar name={profile?.name ?? ""} size={40} active />
          <div className="min-w-0 flex-1">
            <div className="truncate font-body text-[13px] font-medium text-text">
              {profile?.name}
            </div>
            <div className="font-body text-[11px] text-muted">
              {COPY.sidebar.trainerRole}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={COPY.sidebar.logout}
            className="flex cursor-pointer p-1.5 text-muted hover:text-text"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
