# QR Auth Starter

A **Create React App boilerplate for starting a new project with the login pipeline already built**: email/password authentication plus QR-code sign-in (scan with a phone that's already logged in to approve a desktop login). Clone it, plug in your database, and start building your app on top.

**Stack:** React 19 (CRA) · Express API deployed as a single Vercel serverless function · MongoDB (Mongoose) · JWT

## What's included

- Sign up, log in, protected dashboard, logout
- QR login: the desktop shows a QR code, the phone confirms, the desktop signs in automatically
- Sessions that expire (QR codes after 5 min and single-use; login tokens after 1 h)
- Responsive dark UI styled by one CSS file (`src/index.css`)
- One-command local dev, Vercel-ready deployment

## Quick start

```bash
git clone <your-repo-url>
cd <your-repo>
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `.env` and set `MONGO_URI` (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works) and `JWT_SECRET`, then:

```bash
npm run dev
```

The app runs at **http://localhost:3000** (the API runs on port 5000 and is proxied automatically). Requires Node 24.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel. `vercel.json` is already configured.
2. Add `MONGO_URI` and `JWT_SECRET` under **Settings → Environment Variables**.
3. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel's IPs change).
4. Deploy.

## How QR login works

1. The login page asks the API for a signed, expiring session id (no database involved, so the QR code appears instantly) and shows it as a QR code.
2. The phone scans it, opens `/qr-auth.html`, and (if already logged in) taps **Yes, Log Me In**. Only now is a session row written to the database.
3. The desktop, which polls the API, receives a one-time token and goes to the dashboard.

To test the QR flow on a real phone, use your deployed URL, or set `APP_URL` to your computer's LAN address and log in on the phone at that same address.

## Project structure

```
api/index.js         Vercel entry point (exposes the Express app)
backend/             Express app: routes, handlers, local server, API tests
lib/                 MongoDB connection, models, shared helpers
src/
  components/        Login, Signup, Dashboard, QrPanel, ...
  hooks/             useQrLogin, useMediaQuery
  services/          API client
  utils/session.js   Token/session storage
  index.css          The only stylesheet
public/qr-auth.html  Page the phone opens after scanning
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/qr/generate` | Create a QR session |
| GET | `/api/qr/status?sessionId=` | Desktop polls; returns a token once approved |
| POST | `/api/qr/confirm` | Phone approves the session (Bearer token) |
| GET | `/api/health` | Health check |

## Make it yours

- Build your app in `src/components/Dashboard.jsx` and add routes in `src/App.js`
- Change colours in the `:root` block at the top of `src/index.css`
- Add API routes under `backend/routes` and `backend/handlers`

## Scripts

`npm run dev` start API + frontend · `npm run build` production build · `npm test` frontend tests · `npm run test:api` API tests
