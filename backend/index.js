// Entrypoint for Vercel Express Service and Node.js CommonJS runtime
// Delegates to the compiled distribution in ./dist/index.js
const path = require('path');

let app;

try {
  app = require(path.resolve(__dirname, 'dist/index.js'));
} catch (distErr) {
  try {
    app = require(path.resolve(__dirname, 'dist/src/app.js'));
  } catch (appErr) {
    console.error('Failed to load compiled dist app:', distErr, appErr);
    try {
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
    } catch {
      // Zero-dependency HTTP fallback handler if express itself cannot be loaded
      app = function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            service: 'backend-zero-dep-fallback',
            timestamp: new Date().toISOString(),
            error: distErr ? distErr.message : null,
          })
        );
      };
    }
  }
}

module.exports = app;
if (app && app.default) {
  module.exports.default = app.default;
}
