/* Mobvex Trainer — sidebar (brand, nav, trainer footer).
   Static on lg+; below lg it is a slide-in drawer controlled by open/onClose. */
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
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ nav, onNav, onLogout, open, onClose }: Props) {
  const profile = useTrainerProfile();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={COPY.sidebar.closeMenu}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-bg/70 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-[22px]",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-2.5 pb-[22px] pt-1">
          <Mark size={36} />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[24px] leading-none tracking-[2px] text-text">
              {COPY.sidebar.brand}
            </span>
            <span className="font-body text-[10px] uppercase tracking-[2px] text-accent">
              {COPY.sidebar.brandTag}
            </span>
          </div>
          <button
            type="button"
            title={COPY.sidebar.closeMenu}
            onClick={onClose}
            className="ml-auto flex p-1.5 text-muted hover:text-text lg:hidden"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem
            icon="users"
            label={COPY.sidebar.nav.roster}
            active={nav === "roster"}
            onClick={() => onNav("roster")}
          />
          <NavItem
            icon="dumbbell"
            label={COPY.sidebar.nav.exercises}
            active={nav === "exercises"}
            onClick={() => onNav("exercises")}
          />
          <NavItem
            icon="utensils"
            label={COPY.sidebar.nav.diets}
            active={nav === "diets"}
            onClick={() => onNav("diets")}
          />
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <NavItem
            icon="settings"
            label={COPY.sidebar.nav.settings}
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
    </>
  );
}
