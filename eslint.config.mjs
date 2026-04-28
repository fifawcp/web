import { createRequire } from "node:module";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import vitest from "eslint-plugin-vitest";

const require = createRequire(import.meta.url);
const prettierRecommended = require("eslint-plugin-prettier/recommended");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "no-console": "warn",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-dom", group: "external", position: "before" },
            { pattern: "@/**", group: "internal", position: "before" },
            { pattern: "@features/**", group: "internal", position: "before" },
            { pattern: "@shared/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          distinctGroup: false,
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { varsIgnorePattern: "^_$", argsIgnorePattern: "^_$" }],
    },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    ...vitest.configs.env,
    ...vitest.configs.recommended,
  },
  prettierRecommended,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts"]),
]);

export default eslintConfig;
