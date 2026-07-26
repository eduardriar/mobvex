import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '@mobvex/db';
import { Text, colors, fonts, initials, overlays, radius, spacing } from '@mobvex/ui';
import { SquareAvatar } from './SquareAvatar';

type Props = {
  visible: boolean;
  student: { name: string };
  trainer: { name: string };
  onClose: () => void;
};

const DRAWER_WIDTH = 300;

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  description: string;
};

/** Slide-in profile drawer, opened from the home screen's avatar. */
export function ProfileMenu({ visible, student, trainer, onClose }: Props) {
  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!visible) return; // nothing to animate before ever opening
    }

    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, translateX, backdropOpacity]);

  if (!mounted) return null;

  const items: MenuItem[] = [
    {
      icon: <Feather name="target" size={18} color={colors.text} />,
      label: 'Editar perfil',
      description: 'Nombre, foto y datos personales',
    },
    {
      icon: <MaterialCommunityIcons name="dumbbell" size={18} color={colors.text} />,
      label: 'Mi entrenador',
      description: trainer.name || 'Tu entrenador asignado',
    },
    {
      icon: <Feather name="calendar" size={18} color={colors.text} />,
      label: 'Mi plan',
      description: 'Objetivo y duración del programa',
    },
    {
      icon: <Feather name="bell" size={18} color={colors.text} />,
      label: 'Notificaciones',
      description: 'Recordatorios y avisos',
    },
    {
      icon: <Feather name="info" size={18} color={colors.text} />,
      label: 'Ayuda y soporte',
      description: 'Preguntas frecuentes y contacto',
    },
  ];

  const handleSignOut = () => {
    onClose();
    void logout();
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
          onPress={onClose}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          <SafeAreaView style={styles.flex}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  hitSlop={8}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={16} color={colors.text} />
                </Pressable>
              </View>
              <View style={styles.identity}>
                <SquareAvatar initials={initials(student.name)} size={54} />
                <View style={styles.identityText}>
                  <Text variant="cardName" style={styles.name} numberOfLines={1}>
                    {student.name}
                  </Text>
                  <Text variant="cardRole" style={styles.role} numberOfLines={1}>
                    {trainer.name
                      ? `Alumno · Entrenado por ${trainer.name.split(' ')[0]}`
                      : 'Alumno · Mobvex'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.items}>
              {items.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  // TODO: route to the matching screen once it exists.
                  onPress={undefined}
                  style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
                >
                  <View style={styles.itemIcon}>{item.icon}</View>
                  <View style={styles.itemText}>
                    <Text variant="cardName" style={styles.itemLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text variant="cardRole" style={styles.itemDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.muted} />
                </Pressable>
              ))}
            </View>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOut, pressed ? styles.signOutPressed : null]}
              >
                <Feather name="log-out" size={16} color={colors.accent2} />
                <Text style={styles.signOutLabel}>Cerrar sesión</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: overlays.backdrop,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '82%',
    maxWidth: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
  },
  role: {
    marginTop: 3,
  },
  items: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 10,
    borderRadius: radius.card,
  },
  itemPressed: {
    backgroundColor: colors.surface2,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontSize: 14,
  },
  itemDescription: {
    marginTop: 2,
  },
  footer: {
    marginTop: 'auto',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    backgroundColor: overlays.alertBg,
    borderWidth: 1,
    borderColor: overlays.alertBorder,
  },
  signOutPressed: {
    opacity: 0.85,
  },
  signOutLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent2,
  },
});
