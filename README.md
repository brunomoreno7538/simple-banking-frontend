# Core Banking Front‑end (React)

## Overview

This repository contains the **SPA** that complements the Natixis *Hexa Simple Banking* back‑end.
It provides two portals:

* **Core User Portal** – administrative dashboard for managing merchants, accounts and transactions.
* **Merchant Portal** – operational dashboard for an individual commerce (balances, pay‑ins, pay‑outs).

The app is written in **React 19**, bundled with **Vite 6**, uses **Redux Toolkit** with **RTK Query** for API calls and **Tailwind CSS** for styling. All logic is typed with **TypeScript 5.8**.

---

## Architecture (Ports & Adapters on the Front‑end)

* **Presentation Layer** → React components/pages (no business logic).
  Hooks produced by RTK Query serve as *Inbound Adapters* for data.
* **Application Layer** → Redux slices / RTK Query endpoints orchestrate state and side‑effects.
* **Infrastructure Layer** → Pre‑configured providers (Redux, Router, Tailwind), API base URL injection and JWT storage.

This mirrors the back‑end Hexagonal approach: UI never touches `fetch` directly; everything crosses ports defined in the store.

---

## Technologies Used

* React **19.1**
* Vite **6.3**
* TypeScript **5.8** (strict mode)
* Redux Toolkit & RTK Query
* Tailwind CSS **4**
* React‑Router‑DOM **7**
* JWT‑decode **4** (client‑side token parsing)

---

## Prerequisites

* **Node 20+**
* **npm 10+** (or `pnpm`/`yarn`, adjust commands accordingly)

---

## Running the Application Locally

```bash
# 1. Install dependencies
npm ci

# 2. Start Vite dev server (http://localhost:5173)
npm run dev
```

The front‑end expects the back‑end API at **[http://localhost:8080](http://localhost:8080)** by default.
Change it with the `VITE_API_BASE_URL` environment variable (see below).

---

## Environment Variables

| Variable            | Default                 | Purpose                                        |
| ------------------- | ----------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL used by RTK Query to hit the back‑end |

Create a `.env` file at the project root if you need to override:

```env
VITE_API_BASE_URL=https://api.dev.mybank.com
```

---

## Docker

Multi‑stage image: Node 20‑alpine to build, Nginx‑alpine to serve static files.

### Build the Image

```bash
export API=https://api.dev.mybank.com

docker build \
  --build-arg VITE_API_BASE_URL=$API \
  -t natixis-frontend .
```

### Run the Container

```bash
# Maps container port 80 → host 8081 so it doesn’t clash with back‑end

docker run -d -p 8081:80 --name natixis-frontend natixis-frontend
# Now open http://localhost:8081
```

---

## Authentication & Default Credentials

| Role          | Scope                                                 | User / Pass         |
| ------------- | ----------------------------------------------------- | ------------------- |
| **Core User** | Full platform admin (create merchants, view all data) | `admin / 123456`    |
| **Merchant**  | Restricted to its own accounts & transactions         | `merchant / 123456` |

Log in via the back‑end `/api/v1/auth/login` endpoint, grab the JWT and the app will store it in `localStorage`.
