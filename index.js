import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

/**
 * @param {Object} options
 * @param {boolean} [options.react=false] - Enable React support
 * @param {boolean} [options.typescript=true] - Enable TypeScript support
 * @returns {Promise<import('eslint').Linter.Config[]>}
 */
export default async function ammar(options = {}) {
  const { react: enableReact = false, typescript: enableTypeScript = true } = options;

  // Dynamically load TypeScript plugins
  let typescriptEslint;
  let tsParser;
  let tseslint;
  let typescript;

  if (enableTypeScript) {
    const tsEslintPlugin = await import("@typescript-eslint/eslint-plugin");
    const tsEslintParser = await import("@typescript-eslint/parser");
    const tsEslintModule = await import("typescript-eslint");
    typescriptEslint = tsEslintPlugin.default || tsEslintPlugin;
    tsParser = tsEslintParser.default || tsEslintParser;
    tseslint = tsEslintModule;
    typescript = tsEslintModule;
  }

  // Dynamically load React plugins if enabled
  let react;
  let reactHooks;
  let reactRefresh;

  if (enableReact) {
    try {
      const reactModule = await import("eslint-plugin-react");
      const reactHooksModule = await import("eslint-plugin-react-hooks");
      const reactRefreshModule = await import("eslint-plugin-react-refresh");
      react = reactModule.default || reactModule;
      reactHooks = reactHooksModule.default || reactHooksModule;
      reactRefresh = reactRefreshModule.default || reactRefreshModule;
    } catch (error) {
      throw new Error(
        "React support requested but eslint-plugin-react not installed. Run: npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh"
      );
    }
  }

  // Build configs array
  /** @type {import('eslint').Linter.Config[]} */
  const configs = [];

  // Add global ignores
  configs.push(
    globalIgnores([
      "**/node_modules/",
      "**/coverage/",
      "dist",
      "vendor",
      "public",
    ])
  );

  // Add React config if enabled
  if (enableReact) {
    configs.push({
      ...react.configs.flat.recommended,
      ...react.configs.flat["jsx-runtime"], // Required for React 17+
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-unescaped-entities": "off",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    });
  }

  if (enableTypeScript) {
    const tsExtends = compat.extends(
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended"
    );
    const tsConfig = {
      plugins: {
        "@typescript-eslint": typescriptEslint,
      },
      rules: {
        "@typescript-eslint/ban-ts-comment": [
          "error",
          {
            "ts-ignore": true,
            "ts-nocheck": true,
            "ts-check": false,
            "ts-expect-error": "allow-with-description",
          },
        ],
        "@typescript-eslint/consistent-type-imports": [
          "warn",
          {
            prefer: "type-imports",
          },
        ],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "none",
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
          },
        ],
      },
    };
    configs.push(...tsExtends, tsConfig);
  }

  // Main config plugins
  /** @type {Record<string, any>} */
  const mainPlugins = {};
  if (enableReact) {
    mainPlugins["react-hooks"] = reactHooks;
  }

  // Build main config language options
  /** @type {import('eslint').Linter.LanguageOptions} */
  const mainLanguageOptions = {
    globals: {
      ...globals.node,
      ...globals.jest,
      ...globals.browser,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  };

  if (enableTypeScript) {
    mainLanguageOptions.parser = tsParser;
  }

  // Build main config rules
  /** @type {import('eslint').Linter.RulesRecord} */
  const mainRules = {
    eqeqeq: [
      "error",
      "always",
      {
        null: "ignore",
      },
    ],
    "no-var": "error",
    "prefer-const": "error",
    "no-prototype-builtins": "off",
    "no-unused-vars": "off",
  };

  if (enableReact) {
    mainRules["react-hooks/rules-of-hooks"] = "error";
    mainRules["react-hooks/exhaustive-deps"] = "warn";
  }

  // Build main config base
  /** @type {import('eslint').Linter.Config} */
  const mainConfig = {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: mainPlugins,
    languageOptions: mainLanguageOptions,
    rules: { ...mainRules },
  };

  // Merge rules from config objects (avoid full assign due to circular refs in plugins)
  if (enableTypeScript) {
    if (tseslint.configs.recommended.rules) {
      Object.assign(mainConfig.rules, tseslint.configs.recommended.rules);
    }
    if (typescript.configs.recommended.rules) {
      Object.assign(mainConfig.rules, typescript.configs.recommended.rules);
    }
  }

  if (enableReact) {
    if (reactHooks.configs.flat.recommended.rules) {
      Object.assign(mainConfig.rules, reactHooks.configs.flat.recommended.rules);
    }
    if (reactRefresh.configs.vite.rules) {
      Object.assign(mainConfig.rules, reactRefresh.configs.vite.rules);
    }
  }

  configs.push(mainConfig);

  // Add prettier config last
  configs.push(prettier);

  return configs;
}
