module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  ignorePatterns: [
    '.eslintrc.js',
  ],
  rules: {
    // Allow explicit any to make selection generics easier to manage
    '@typescript-eslint/no-explicit-any': 0,
  },
}
