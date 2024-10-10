const ERROR = 'error';
const OFF = 'off';

module.exports = {
    extends: [require.resolve('eslint-config-airbnb-base'), 'plugin:jest/recommended', 'prettier'],
    plugins: ['jest', 'prettier'],
    globals: {
        Promise: true,
        process: true,
        global: true,
    },
    parserOptions: {
        ecmaVersion: 12, // ECMAscript 2021, which supports fully with node 16.
    },
    rules: {
        'no-plusplus': OFF,
        'no-prototype-builtins': OFF,
        'no-underscore-dangle': OFF,
        'no-use-before-define': [ERROR, { functions: false, classes: true }],
        'no-restricted-syntax': [ERROR, 'ForInStatement'], // based on eslint-config-airbnb-base
        'padding-line-between-statements': [
            ERROR,
            { blankLine: 'always', prev: '*', next: '*' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
            { blankLine: 'any', prev: ['expression'], next: ['expression'] },
            { blankLine: 'any', prev: ['case', 'default'], next: '*' },
        ],
        'no-await-in-loop': OFF,
        'linebreak-style': OFF,
        'class-methods-use-this': OFF,
        'object-curly-newline': OFF,
        'max-len': [ERROR, { code: 120 }],
        'import/prefer-default-export': OFF,
        'import/no-extraneous-dependencies': [ERROR, { devDependencies: true }],
        'prettier/prettier': ERROR,
        'jest/no-deprecated-functions': OFF,
        'jest/expect-expect': OFF,
    },
};
