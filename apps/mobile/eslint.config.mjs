import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // Node tooling config files (not part of the app/TS program).
    ignores: [
      '.expo/**',
      'dist/**',
      'expo-env.d.ts',
      'babel.config.js',
      'metro.config.js',
    ],
  },
];
