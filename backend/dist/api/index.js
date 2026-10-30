"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("../src/app");
// Initialize the Express app
const app = (0, app_1.createApp)();
// Export the app for Vercel serverless function (both CommonJS and ESM)
exports.default = app;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
    module.exports.default = app;
}
//# sourceMappingURL=index.js.map