/**
 * Auth session storage adapter, resolved per-platform.
 *
 * This default module is used on web and in Node, where supabase-js's built-in
 * storage is appropriate, so it exports `undefined`. React Native (Expo/Metro)
 * resolves `storage.native.ts` instead, which supplies AsyncStorage so the auth
 * session survives app restarts.
 */
export type SessionStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

export const sessionStorage: SessionStorage | undefined = undefined;
