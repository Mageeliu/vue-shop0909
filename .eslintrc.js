module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'linebreak-style': [
      0,
      'error',
      'windows'
    ],
    'space-before-function-paren': 0,
    'no-unused-vars': 'off',
    'vue/no-unused-vars': 'off'
  },

  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
