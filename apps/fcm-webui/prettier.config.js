import prettierBase from '@fcm/eslint-config/prettier.config'

/** @type {import("prettier").Config} */
export default {
  ...prettierBase,
  singleAttributePerLine: false,
  jsxBracketSameLine: true,
  bracketSameLine: true,
}
