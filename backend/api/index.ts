import 'dotenv/config';
import { createApp } from '../src/app';

// Initialize the Express app
const app = createApp();

// Export the app for Vercel serverless function (both CommonJS and ESM)
export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}
