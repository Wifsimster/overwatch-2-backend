module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ['error', 2], // indent with 2 spaces
    quotes: ['error', 'single'], // force single quotes
    semi: ['error', 'never'], // remove semicolons
    eqeqeq: 'warn', // require === and !==
    curly: ['error', 'all'],
    yoda: 'warn', // requires 'yoda' condition statements
    'linebreak-style': 'off', // don't matter line ending style
    'default-case': 'warn', // require default case in switch statements
    'no-implicit-coercion': 'warn', // disallows implicit type conversion methods
    'no-var': 'warn', // requires let or const, not var
    'vue/no-unused-vars': 'off',
    'max-len': 'off',
  },
}
