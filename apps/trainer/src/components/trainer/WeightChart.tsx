/* Mobvex Trainer — weight trend line chart. */
type Props = {
  data: number[];
  target: number;
  w?: number;
  h?: number;
};

export function WeightChart({ data, target, w = 560, h = 180 }: Props) {
  const padL = 8;
  const padR = 8;
  const padT = 16;
  const padB = 22;
  const vals = data.concat([target]);
  const min = Math.min(...vals) - 0.6;
  const max = Math.max(...vals) + 0.6;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * innerH;
  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)} ${(padT + innerH).toFixed(
    1,
  )} L${padL} ${(padT + innerH).toFixed(1)} Z`;
  const ty = y(target);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      className="block overflow-visible"
    >
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => (
        <line
          key={g}
          x1={padL}
          x2={w - padR}
          y1={padT + g * innerH}
          y2={padT + g * innerH}
          stroke="#2A2A30"
          strokeWidth="1"
        />
      ))}
      <line
        x1={padL}
        x2={w - padR}
        y1={ty}
        y2={ty}
        stroke="#6B6B78"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text
        x={w - padR}
        y={ty - 6}
        textAnchor="end"
        fontFamily="var(--font-body)"
        fontSize="11"
        fill="#6B6B78"
      >
        objetivo {target} kg
      </text>
      <path d={area} fill="url(#wfill)" />
      <path
        d={line}
        fill="none"
        stroke="#C8FF00"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === data.length - 1 ? 4.5 : 2.5}
          fill={i === data.length - 1 ? "#C8FF00" : "#0A0A0B"}
          stroke="#C8FF00"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
