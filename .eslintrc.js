module.exports = {
    env: {
        commonjs: true,
        es: true,
        mocha: true,
    },
    extends: [
        'airbnb-base',
    ],
    rules: {
        'no-await-in-loop': 0,
        'max-len': ['error', {code: 180}],
        'no-console': 'off',
    },
}
