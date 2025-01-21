const eslint = require('@eslint/js');
const eslintPluginAstro = require('eslint-plugin-astro');
const tseslint = require('typescript-eslint');

module.exports = [
  // add more generic rule sets here, such as:
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // js.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'], // In CommonJS, the `flat/` prefix is required.
  {
    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    }
  }
];