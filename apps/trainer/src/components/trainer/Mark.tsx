/* Mobvex Trainer — brand mark. */
type Props = {
  size?: number;
};

export function Mark({ size = 34 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      className="block"
    >
      <rect width="56" height="56" rx="16" fill="#0A0A0B" stroke="#2A2A30" />
      <circle cx="28" cy="28" r="16" fill="#C8FF00" />
      <path
        d="M21 28 L26 33 L36 22"
        stroke="#0A0A0B"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
