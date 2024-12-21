import baseConfig from '@fcm/eslint-config/nest-js'

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
            // Add any fcm-api specific rules here
        },
    },
]
