import { StyleSheet, View } from 'react-native';
import { colors } from '@mobvex/ui';

type Props = {
  /** Values in chronological order (oldest → newest). */
  values: number[];
  width?: number;
  height?: number;
};

/**
 * Minimal line sparkline drawn with plain Views (no SVG dependency): each
 * segment between consecutive points is a thin rotated bar, with an accent dot
 * at the latest point.
 */
export function Sparkline({ values, width = 150, height = 60 }: Props) {
  if (values.length < 2) {
    return <View style={{ width, height }} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 8; // keep the line off the top/bottom edges
  const innerH = height - padY * 2;

  const points = values.map((value, i) => ({
    x: (i / (values.length - 1)) * width,
    y: padY + (1 - (value - min) / range) * innerH,
  }));

  const segments = points.slice(0, -1).map((a, i) => {
    const b = points[i + 1];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const angleDeg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    // Place the bar centered on the segment's midpoint, then rotate about center.
    return {
      left: (a.x + b.x) / 2 - length / 2,
      top: (a.y + b.y) / 2 - 1,
      length,
      angleDeg,
    };
  });

  const last = points[points.length - 1];

  return (
    <View style={{ width, height }}>
      {segments.map((s, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              left: s.left,
              top: s.top,
              width: s.length,
              transform: [{ rotate: `${s.angleDeg}deg` }],
            },
          ]}
        />
      ))}
      <View style={[styles.dot, { left: last.x - 4, top: last.y - 4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
