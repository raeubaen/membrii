// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 12,    // modern JS
    sourceType: "module" // use "module" if your code is ES modules
  },
  rules: {
    "strict": ["error", "global"], // ⚡ enforce global 'use strict';
    "no-undef": "error",           // detect undeclared variables
    "no-unused-vars": "warn"       // optional: warn on unused vars
  }
};
