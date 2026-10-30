"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const ws_1 = __importDefault(require("ws"));
// Polyfill WebSocket for Supabase Realtime in environments where it is missing
try {
    if (typeof globalThis.WebSocket === 'undefined') {
        globalThis.WebSocket = ws_1.default;
    }
}
catch {
    // Ignore in strict or read-only runtimes
}
// Safely initialize client only when valid URL and Key are provided
exports.supabase = (() => {
    try {
        return env_1.env.SUPABASE_URL && env_1.env.SUPABASE_SERVICE_KEY
            ? (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_KEY)
            : null;
    }
    catch {
        return null;
    }
})();
//# sourceMappingURL=supabase.js.map