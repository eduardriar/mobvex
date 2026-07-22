import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Text, colors, fonts, fontSizes, spacing } from '@mobvex/ui';

type Props = {
  /** YouTube video ID (already parsed from the exercise's media_url). */
  videoId: string;
};

// Renders the real YouTube IFrame Player API (not a bare /embed/ URL) so we
// can listen for its onError event — some videos (often Shorts, or ones the
// uploader restricted) refuse to play embedded and YouTube's own player just
// shows an opaque "Error 153" screen with no way for us to react to it.
function buildPlayerHtml(videoId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>html,body,#player{margin:0;padding:0;width:100%;height:100%;background:#000;}</style>
</head>
<body>
  <div id="player"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    function onYouTubeIframeAPIReady() {
      new YT.Player('player', {
        videoId: '${videoId}',
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          },
          onError: function (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', code: e.data }));
          }
        }
      });
    }
  </script>
</body>
</html>`;
}

// Some restricted videos (often Shorts) never fire the IFrame API's onError
// event at all — the player just renders its own opaque error screen inside
// the iframe and stays silent. A readiness timeout catches that silent case
// too: if we haven't heard "ready" by then, treat it as blocked.
const READY_TIMEOUT_MS = 7000;

/** Embedded YouTube player for an exercise's demo video, with a native fallback for videos that refuse to embed. */
export function ExerciseVideoPlayer({ videoId }: Props) {
  const [blocked, setBlocked] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    readyRef.current = false;
    const timer = setTimeout(() => {
      if (!readyRef.current) setBlocked(true);
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [videoId]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      const type =
        typeof message === 'object' && message !== null
          ? (message as Record<string, unknown>).type
          : null;
      if (type === 'ready') {
        readyRef.current = true;
      } else if (type === 'error') {
        setBlocked(true);
      }
    } catch {
      // Ignore malformed messages.
    }
  };

  if (blocked) {
    return (
      <View style={styles.fallback}>
        <Feather name="alert-circle" size={32} color={colors.muted} />
        <Text style={styles.fallbackText}>
          Este video no se puede reproducir aquí.
        </Text>
        <Pressable
          style={styles.fallbackButton}
          onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
        >
          <Feather name="external-link" size={16} color={colors.onAccent} />
          <Text style={styles.fallbackButtonText}>ABRIR EN YOUTUBE</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: buildPlayerHtml(videoId) }}
        style={styles.webview}
        onMessage={handleMessage}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  fallbackText: {
    fontSize: fontSizes.input,
    color: colors.muted,
    textAlign: 'center',
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  fallbackButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.buttonPrimary,
    letterSpacing: 2,
    color: colors.onAccent,
  },
});
