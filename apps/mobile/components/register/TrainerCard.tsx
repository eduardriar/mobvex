import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar, Badge, Card, Text, spacing } from '@mobvex/ui';

type Props = {
  name: string;
  role: string;
  badge?: string;
  style?: StyleProp<ViewStyle>;
};

/** Invitation / assigned-trainer summary card used across the registration flow. */
export function TrainerCard({ name, role, badge = 'Invitación activa', style }: Props) {
  return (
    <Card style={[styles.card, style]}>
      <Avatar name={name} size="md" />
      <View style={styles.info}>
        <Text variant="cardName">{name}</Text>
        <Text variant="cardRole">{role}</Text>
      </View>
      <Badge label={badge} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
  },
});
