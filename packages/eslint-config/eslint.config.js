import { config as baseConfig } from '@fcm/eslint-config/base'

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
            // Add any @fcm/webui specific rules here
        },
    },
]
