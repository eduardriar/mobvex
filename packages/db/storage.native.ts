import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SessionStorage } from './storage';

/**
 * React Native session storage. Metro resolves this file over `storage.ts` on
 * native platforms, giving the Supabase auth client AsyncStorage so the session
 * persists across app restarts.
 */
export const sessionStorage: SessionStorage = AsyncStorage;
