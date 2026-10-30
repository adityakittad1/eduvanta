// Entrypoint for Vercel Express Service and Node.js CommonJS runtime
// Delegates to the compiled distribution in ./dist/index.js
let app;

try {
  app = require('./dist/index.js');
} catch (distErr) {
  try {
    app = require('./dist/src/app.js');
  } catch (appErr) {
    console.error('Failed to load compiled dist app:', distErr, appErr);
    const express = require('express');
    app = express();
    app.get(['/health', '/api/health', '/api/v1/health'], (_req, res) => {
      res.status(200).json({
        status: 'ok',
        service: 'backend-fallback',
        timestamp: new Date().toISOString(),
        error: distErr ? distErr.message : null,
      });
    });
  }
}

module.exports = app;
if (app && app.default) {
  module.exports.default = app.default;
}
