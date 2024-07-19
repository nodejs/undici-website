/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ["next", "next/core-web-vitals", "prettier"],
  rules: {},
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
};
