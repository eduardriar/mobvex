import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text, colors, overlays, spacing } from '@mobvex/ui';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
  onPress?: () => void;
};

/** Dashboard placeholder card: neon icon, short title and a guiding message. */
export function EmptyStateCard({ icon, title, message, onPress }: Props) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.text}>
          <Text variant="cardName">{title}</Text>
          <Text variant="cardRole" style={styles.message}>
            {message}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: overlays.accentIconBg,
    borderWidth: 1,
    borderColor: overlays.accentIconBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  message: {
    marginTop: 2,
    lineHeight: 18,
  },
});
