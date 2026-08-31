import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
    js.configs.recommended,

    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
        semi: true,
        jsx: true,
        blockSpacing: true,
    }),

    {
        languageOptions: {
            globals: {
                ...globals.node,
            }
        },

        rules: {
            'camelcase': ['warn', {
                properties: 'always',
                ignoreDestructuring: false,
                ignoreImports: true,
            }],

            '@stylistic/arrow-parens': ['error', 'as-needed', {
                requireForBlockBody: false,
            }],

            '@stylistic/quotes': ['error', 'single', {
                avoidEscape: true,
                allowTemplateLiterals: true,
            }],
        },
    },
];
