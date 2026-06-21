import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

// Flat config per Next.js 16's official ESLint migration (`next lint` was removed;
// lint runs via the ESLint CLI). Minimal quick-start: the Next core-web-vitals
// shared config + build-output/generated ignores. Custom rules are a later concern.
export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
