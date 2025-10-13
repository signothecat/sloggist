// eslint.config.mjs
import js from "@eslint/js";
import json from "@eslint/json";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  // === Global ignores (build/artifact/vendor files) ===
  { ignores: ["**/.next/**", "**/node_modules/**", "**/dist/**", "**/coverage/**", "**/out/**", "**/.vscode/**", "package-lock.json"] },

  // === Base config (js) ===
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // unused: ignore variables starting with _
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
    // no import restrictions here (to allow server-only code)
  },

  // === React rules (js/jsx)  ===
  {
    files: ["**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: { version: "detect" }, // silence version warning
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
  },

  // === Restrict importing server modules in client-side code ===
  {
    files: ["components/**/*.{js,jsx}", "contexts/**/*.{js,jsx}", "pages/**/*.{js,jsx}"],
    ignores: ["pages/api/**", "lib/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          // Restrict importing server modules in client-side code
          patterns: [
            {
              group: ["@/lib/server/*", "@/server/*"],
              message: "server-sideモジュールはclient側ではimport禁止",
            },
          ],
          // Restrict Node core modules import in client-side code
          paths: [
            { name: "fs", message: "Node core moduleはclient側では使用禁止" },
            { name: "path", message: "Node core moduleはclient側では使用禁止" },
            { name: "crypto", message: "Node core moduleはclient側では使用禁止" },
            { name: "os", message: "Node core moduleはclient側では使用禁止" },
            { name: "zlib", message: "Node core moduleはclient側では使用禁止" },
          ],
        },
      ],
    },
  },

  // === json configuration (pure json only) ===
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
]);
