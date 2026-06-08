import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, colors, fonts } from '@mobvex/ui';

type TabConfig = {
  label: string;
  icon: (color: string) => React.ReactNode;
};

// Keys are route names (English); labels are user-facing copy (Spanish).
const TABS: Record<string, TabConfig> = {
  index: { label: 'Inicio', icon: (c) => <Feather name="home" size={20} color={c} /> },
  routines: { label: 'Rutinas', icon: (c) => <Feather name="bar-chart-2" size={20} color={c} /> },
  progress: { label: 'Progreso', icon: (c) => <Feather name="clock" size={20} color={c} /> },
  tips: { label: 'Tips', icon: (c) => <Feather name="info" size={20} color={c} /> },
  recipes: {
    label: 'Nutrición',
    icon: (c) => <MaterialCommunityIcons name="chef-hat" size={20} color={c} />,
  },
};

/** Custom bottom navigation matching the neon design system. */
export function StudentTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;

        const focused = state.index === index;
        const color = focused ? colors.accent : colors.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={styles.item}
          >
            {tab.icon(color)}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            {focused ? <View style={styles.dot} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: -2,
  },
});
