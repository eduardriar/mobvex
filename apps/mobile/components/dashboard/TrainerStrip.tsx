import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, colors } from '@mobvex/ui';
import { SquareAvatar } from './SquareAvatar';

type Props = {
  name: string;
  role: string;
  initials: string;
  onMessage?: () => void;
};

/** Assigned-trainer strip with a "new message" affordance. */
export function TrainerStrip({ name, role, initials, onMessage }: Props) {
  return (
    <View style={styles.strip}>
      <SquareAvatar initials={initials} />
      <View style={styles.info}>
        <Text variant="cardName" style={styles.name}>
          {name}
        </Text>
        <Text variant="cardRole">{role}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nuevo mensaje"
        onPress={onMessage}
        style={styles.msg}
      >
        <Feather name="message-square" size={13} color={colors.muted} />
        <Text variant="cardRole">Nuevo mensaje</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
  },
  msg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
