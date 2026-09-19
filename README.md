# 🔐 QR Authentication System



<div align="center">

![QR Authentication](https://img.shields.io/badge/QR-Authentication-blue?style=for-the-badge\&logo=qrcode\&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Express.js-green?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge\&logo=mongodb)

**Professional · Passwordless · Cross-Device Authentication — No App Required**

[🐞 Report Bug](https://github.com/shifatsrm09/QRAuthentication/issues) · [💡 Request Feature](https://github.com/shifatsrm09/QRAuthentication/issues)

</div>

---

## 📌 Overview

**QR Authentication** is a **production-ready, passwordless login system** that enables users to authenticate seamlessly across devices.

🔑 **How it works:**

* Scan a QR code on your desktop with your already-logged-in mobile browser.
* Authenticate instantly — no extra apps required.
* Backed by **JWT security, MongoDB Atlas, and a Node.js backend**.

---

## ✨ Features

*  **Cross-Device Authentication** — login on desktop using mobile
*  **JWT Security** — stateless, token-based authentication
*  **No App Required** — works in any mobile browser
*  **Real-Time Sync** — instant login detection
*  **Secure Sessions** — auto-expiring QR tokens
*  **Plug & Play** — modular, reusable system
*  **Cloud Ready** — fully serverless on Vercel + MongoDB Atlas

---

## 🛠️ Tech Stack

* **Frontend:** React, Axios, React Router
* **Backend:** Vercel Serverless Functions (`/api`), JWT
* **Database:** MongoDB Atlas
* **Hosting:** Vercel (frontend + API on one origin)

---

## 🎯 Use Cases

* 🔑 Passwordless login for any web application
* 🏢 Enterprise apps requiring quick & secure login
* 📱 Plug-and-play authentication for future projects
* 🌐 Scalable, modern, cross-platform authentication

---

## 🤝 Contribution

This project is **open-source**. Contributions, issues, and feature requests are welcome!

* Fork it
* Create a branch
* Submit a pull request

---


## Getting Started

Use Node.js 24. The React frontend is in the repository root; Express is in backend/.

### Install

Run npm install in the repository root. You may also run npm install inside backend/ when working there; the root install is required for the shared libraries.

Copy .env.example to .env.local in the root and backend/.env.example to backend/.env. Set MONGO_URI and JWT_SECRET in backend/.env. Existing shell variables take precedence, followed by backend/.env.local, backend/.env, root .env.local, and root .env.

### Run locally

In the repository root (frontend):

```bash
npm start
```

In a second terminal (backend):

```bash
cd backend
npm start
```

Open http://localhost:3000. React reloads on edits, and the backend restarts on edits using Node's watch mode. The frontend proxies /api to port 5000. If you change the backend port, set API_PORT in the root .env.local to the same port.

Alternatively, run npm run dev from the root to start both together.

For cross-device QR testing, open http://YOUR-LAN-IP:3000 on both desktop and phone on the same network. Log in on the phone, then scan and confirm the desktop QR. The QR URL follows the frontend request origin; APP_URL can override it. A phone cannot access your computer through localhost. Allow port 3000 through your firewall if needed.

If local QR generation fails with `querySrv ECONNREFUSED`, your DNS resolver may be refusing MongoDB Atlas SRV queries. Set `MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8` in `backend/.env.local` and restart the backend. This optional override is local; leave it unset on Vercel unless its DNS also needs an override.

### Vercel deployment

Import the repository with its root directory set to the repository root, using the Create React App preset. vercel.json sets npm run build and the build output folder. React is served as static files; /api/* routes to api/index.js, which exports the same Express app used locally. The backend is included in deployment and does not open a listening port in Vercel.

Set MONGO_URI and JWT_SECRET in Vercel Project Settings → Environment Variables for each deployment environment you use. Optionally set APP_URL to your public frontend origin. Keep REACT_APP_API_URL=/api (or omit it); do not use the old Render URL. Local .env files are not transferred. Configure MongoDB network access to allow the deployment to connect.

Push to Vercel's connected production branch to trigger deployment. Changes to environment variables require a new deployment. /api/health checks that the API is running; authentication and QR endpoints also require MongoDB.

### Verification

```bash
npm run build
npm run test:api
npm test -- --watchAll=false
```

API tests exercise the real Express routes with an in-memory model stub, including signup, password login, QR confirmation/token exchange, expiry, and replay prevention. They do not write to your MongoDB database.

## License

Licensed under the MIT License.
