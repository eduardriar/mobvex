import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, colors, fonts, letterSpacing } from '@mobvex/ui';
import { IconButton } from './IconButton';
import { SquareAvatar } from './SquareAvatar';

type Props = {
  greeting: string;
  name: string;
  initials: string;
  hasUnread?: boolean;
  onNotifications?: () => void;
};

/** Top greeting row: salutation + name, notifications, avatar. */
export function DashboardHeader({
  greeting,
  name,
  initials,
  hasUnread = false,
  onNotifications,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.greetingBlock}>
        <Text variant="cardRole" style={styles.salutation}>
          {greeting}
        </Text>
        <Text style={styles.name}>{name.toUpperCase()} 👋</Text>
      </View>
      <View style={styles.actions}>
        <IconButton
          dot={hasUnread}
          onPress={onNotifications}
          accessibilityLabel="Notificaciones"
        >
          <Feather name="bell" size={16} color={colors.text} />
        </IconButton>
        <SquareAvatar initials={initials} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    flex: 1,
  },
  salutation: {
    fontSize: 13,
    marginBottom: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: letterSpacing.title,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
