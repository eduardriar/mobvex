import { useEffect, useState } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { Text, colors, fonts, fontSizes } from '@mobvex/ui';

type Props = {
  /** ISO timestamp of when the session started. */
  startedAt: string;
  style?: StyleProp<TextStyle>;
};

const pad = (n: number) => n.toString().padStart(2, '0');

/** Format elapsed milliseconds as M:SS, or H:MM:SS once past an hour. */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/**
 * Live elapsed-time readout for the active workout, counting up from the
 * session's start. Ticks once per second. Rendered as plain text.
 */
export function WorkoutClock({ startedAt, style }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const label = formatElapsed(now - new Date(startedAt).getTime());

  return (
    <Text
      accessibilityRole="timer"
      accessibilityLabel={`Tiempo de entrenamiento: ${label}`}
      style={[styles.time, style]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  time: {
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    fontWeight: '500',
    color: colors.accent,
    // Keep the width stable as the seconds change.
    fontVariant: ['tabular-nums'],
  },
});
