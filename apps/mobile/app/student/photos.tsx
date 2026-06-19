import { useMemo, useState } from 'react';
import { Alert as RNAlert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Button,
  Screen,
  Text,
  colors,
  spacing,
  type CategoryHue,
} from '@mobvex/ui';
import type { PhotoPose } from '@mobvex/db';
import { PhotoCaptureTile } from '@/components/progress/PhotoCaptureTile';
import { usePhotoSession } from '@/hooks/usePhotoSession';
import { useAuth } from '@/components/auth/AuthProvider';

type PoseSpec = { pose: PhotoPose; label: string; hint: string; hue: CategoryHue };

// The standard four progress-photo poses.
const POSES: PoseSpec[] = [
  { pose: 'front', label: 'Frente', hint: 'De pie, brazos relajados', hue: 'orange' },
  { pose: 'left', label: 'Lado izquierdo', hint: 'Perfil izquierdo', hue: 'purple' },
  { pose: 'right', label: 'Lado derecho', hint: 'Perfil derecho', hue: 'blue' },
  { pose: 'back', label: 'Espalda', hint: 'De espaldas a la cámara', hue: 'green' },
];

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.7,
  base64: true,
};

// atob is provided by the React Native (Hermes) runtime.
declare const atob: (data: string) => string;

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export default function NewPhotos() {
  const router = useRouter();
  const { studentId } = useAuth();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { poses, error, upload, reset } = usePhotoSession(studentId, today);
  const [submitting, setSubmitting] = useState(false);

  // Enable "Listo" only once every pose has a photo.
  const allPosesCaptured = POSES.every((spec) => Boolean(poses[spec.pose].url));

  const onDone = async () => {
    setSubmitting(true);
    // Simulate uploading the set of photos to the backend.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    reset(); // clear the taken photos
    RNAlert.alert('Fotos guardadas', 'Tus fotos de progreso se subieron.');
    router.back()
  };

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const capture = async (pose: PhotoPose, source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      RNAlert.alert(
        'Permiso necesario',
        source === 'camera'
          ? 'Activa el acceso a la cámara para tomar fotos.'
          : 'Activa el acceso a tus fotos para elegir una imagen.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.base64) return;
    await upload(pose, base64ToBytes(asset.base64), asset.mimeType ?? 'image/jpeg');
  };

  const onPickPose = (pose: PhotoPose) => {
    RNAlert.alert('Añadir foto', 'Elige el origen de la imagen', [
      { text: 'Cámara', onPress: () => capture(pose, 'camera') },
      { text: 'Galería', onPress: () => capture(pose, 'library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="label" style={styles.eyebrow}>
            Registro fotográfico
          </Text>
          <Text variant="title" style={styles.title}>
            NUEVAS FOTOS
          </Text>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={14} color={colors.muted} />
            <Text variant="subtitle">{dateLabel}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Feather name="x" size={24} color={colors.muted} />
        </Pressable>
      </View>

      {error ? (
        <Alert message="No pudimos subir la foto. Inténtalo de nuevo." style={styles.alert} />
      ) : null}

      <View style={styles.grid}>
        {POSES.map((spec) => (
          <PhotoCaptureTile
            key={spec.pose}
            label={spec.label}
            hint={spec.hint}
            hue={spec.hue}
            imageUrl={poses[spec.pose].url}
            uploading={poses[spec.pose].uploading}
            onPress={() => onPickPose(spec.pose)}
          />
        ))}
      </View>

      <Text variant="footnote" style={styles.hint}>
        Toca una pose para tomar o elegir una foto. Se guardan de forma privada.
      </Text>

      <Button
        label="LISTO"
        variant="secondary"
        fullWidth
        loading={submitting}
        disabled={!allPosesCaptured}
        onPress={onDone}
        style={styles.done}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    lineHeight: 36,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  alert: {
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
    marginTop: spacing.xl,
  },
  hint: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  done: {
    marginTop: spacing.lg,
  },
});
