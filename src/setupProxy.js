// src/setupProxy.js
// Dev-only: CRA loads this automatically when running `npm run dev:web` / `npm start`.
// Forwards /api/* to the local API server (backend/server.js).
// Ignored by production builds, so it has no effect on Vercel.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: `http://localhost:${process.env.API_PORT || 5000}`,
      changeOrigin: true,
      xfwd: true, // pass the original host so QR URLs point at localhost:3000
      logLevel: "warn",
    })
  );
};
