// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import preferArrow from 'eslint-plugin-prefer-arrow';
import eslintImport from 'eslint-plugin-import';
import eslintConfigPrettier from "eslint-config-prettier";
import unicorn from 'eslint-plugin-unicorn';

export default [
    eslint.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    { ignores: ['**/dist/**', '**/node_modules/**', '**/*.js', '**/*.mjs'] },
    {
        plugins: {
            '@stylistic/ts': stylisticTs,
            'prefer-arrow': preferArrow,
            'import': eslintImport,
            'unicorn': unicorn,
        },
        rules: {
            '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
            '@stylistic/ts/semi': ['error', 'always'],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowBoolean: true }],
            'prefer-arrow-callback': "error",
            'prefer-arrow/prefer-arrow-functions': 'error',
            "import/order": "error",
            "unicorn/no-unused-properties": "error",
        },
    },
    {
        // disable `any` checks in tests
        files: ['**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
    {
        files: ['**/*.adapter.ts'],
        rules: {
            '@typescript-eslint/no-extraneous-class': 'off',
        },
    },
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigDirName: './',
            },
        },
    },
];
