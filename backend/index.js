// Entrypoint for Vercel Express Service and Node.js CommonJS runtime
// Delegates to the TypeScript compiled distribution in ./dist/index.js
const app = require('./dist/index.js');

module.exports = app;
module.exports.default = app;
