import { config as baseConfig } from './base.js'

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...baseConfig,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            // Add any @fcm/api specific rules here
        },
    },
]
