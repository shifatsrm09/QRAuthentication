// lib/db.js
// Serverless-safe MongoDB connection.
// Vercel may reuse a warm function instance for many requests, so we cache the
// connection on `global` instead of reconnecting every time.
const mongoose = require("mongoose");
const dns = require("node:dns");

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (!cached.promise) {
    // Optional workaround for local DNS servers that cannot resolve Atlas SRV
    // records. Leave unset to use the host's normal DNS (including on Vercel).
    if (process.env.MONGO_DNS_SERVERS) {
      dns.setServers(process.env.MONGO_DNS_SERVERS.split(",").map(s => s.trim()).filter(Boolean));
    }
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false, // fail fast instead of silently queueing
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 5, // keep small: every warm instance opens its own pool
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
