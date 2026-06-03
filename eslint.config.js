import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {ignores: ["build"]},
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat["recommended-latest"],
        ],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.browser,
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {jsx: true},
            },
        },
        rules: {
            "no-unused-vars": ["warn", {args: "none", caughtErrors: "none"}],
            "no-useless-catch": "off",
            "eqeqeq": "error",
            "no-console": ["error", {allow: ["warn", "error"]}],
            "no-else-return": "error",
            "no-return-await": "error",
            "no-useless-rename": "error",
            "object-shorthand": "error",
            "prefer-const": "error",
        },
    },
);
