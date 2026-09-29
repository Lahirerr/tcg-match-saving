import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app is fully client-side (localStorage + a runtime fetch of the
      // Pokémon sprite data), so the one-time mount effect that hydrates state
      // from those sources is the intended pattern, not something to avoid.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local git worktree checkouts (each has its own node_modules/source tree)
    ".claude/**",
  ]),
]);

export default eslintConfig;
