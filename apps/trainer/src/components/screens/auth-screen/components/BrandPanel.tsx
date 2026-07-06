import { Mark } from "@/components/trainer/Mark";

const STATS: Array<[string, string]> = [
  ["120+", "alumnos activos"],
  ["18 k", "sesiones guiadas"],
  ["96 %", "adherencia media"],
];

export function BrandPanel() {
  return (
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
        <span className="font-display text-[28px] tracking-[2px] text-text">MOBVEX</span>
      </div>

      <div className="relative my-10 lg:my-auto">
        <div className="mb-5 font-body text-[12px] uppercase tracking-[2px] text-accent">
          Panel del entrenador
        </div>
        <h2 className="m-0 font-display text-[38px] leading-[1.06] tracking-[0.5px] text-text lg:text-[50px]">
          Entrena a tu equipo, sin fricción.
        </h2>
        <p className="mt-6 max-w-[40ch] font-body text-[15px] leading-[1.6] text-muted">
          Gestiona a tus alumnos, sigue su progreso y asigna rutinas y dietas — todo desde un
          mismo lugar.
        </p>
      </div>

      <div className="relative flex gap-7">
        {STATS.map(([n, l]) => (
          <div key={l}>
            <div className="font-display text-[30px] leading-none text-accent">{n}</div>
            <div className="mt-1 font-body text-[12px] text-muted">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
