# WhatTech

A tool-first consumer technology decision platform built with React, TypeScript, and Vite.

## Product surfaces

- Will It Work? — connector, protocol, display, charging, wattage, and safety analysis
- Fix My Device — category-aware troubleshooting, ranked causes, safety escalation, and optional sourced Community Search
- Should I Upgrade? — priority, support-life, resale, budget, and net-cost scoring
- Repair or Replace? — quote, replacement cost, value, condition, and useful-life analysis
- What’s It Worth? — condition, battery, accessories, region, and confidence ranges
- What Do I Need? — direct cable, adapter, dock, multi-display, and bandwidth planning
- What Should I Buy? — ranked catalog matches with strengths and compromises
- Compare Devices — overall answer, category winners, and detailed specifications
- Category → brand → model catalog and device hub pages

The bundled reference catalog contains 196 devices across 21 categories, including 73 phones and 19 monitors. The homepage provides direct access to all eight decision tools, while the full device directory remains available. Stored local catalog edits are migrated and merged when bundled catalog data expands.

The platform also includes a Community Forum with device-linked questions, searchable filters, discussion pages, and responses.

## Run locally

```bash
npm install
npm run dev
```

## Community Search

The `/api/research` server function runs two targeted Brave searches using the device, selected issue, issue-specific phrases, and the user's symptom description. It rejects results that do not mention both the model and the problem, then ranks and de-duplicates the remaining Reddit/forum posts. Copy `.env.example` to `.env`, add `BRAVE_SEARCH_API_KEY`, and keep the key server-side. No AI summarization service or second API key is required.

Results are cached for 24 hours by device, issue, and symptom description in the browser and in each warm server instance. The browser cache prevents repeated identical searches from consuming another API request during that period; the server cache also de-duplicates requests that reach the same running function instance.

`npm run dev` serves both the Vite frontend and a local middleware version of `/api/research`. Restart the development server after adding or changing `.env` values. The deployed endpoint continues to run as a Vercel server function.

## Community Forum: Render backend + Vercel frontend

Forum posts and replies always come from PostgreSQL through the Render API. There are no bundled discussions or browser-only posting fallbacks.

### Deploy the backend on Render

The repository includes `render.yaml`, which creates a `whattech-api` Node web service and a private `whattech-db` PostgreSQL database. Connect this repository as a Render Blueprint. The backend lives in `backend/`, applies the idempotent migration at startup, and exposes `/health` and `/api/forum`.

Set `FRONTEND_ORIGINS` in Render to a comma-separated list of exact frontend origins, for example:

```text
https://your-project.vercel.app,https://whattech.example
```

If you already have a Render PostgreSQL database, create only the web service with root directory `backend`, build command `npm ci --omit=dev`, and start command `npm start`. Set its `DATABASE_URL` to the database's internal connection string.

After the first deployment, verify `https://your-api.onrender.com/health` returns `{"status":"ok"}`. Render's free services can take a short time to wake after being idle; the forum now exposes a retry action for that case.

### Connect the Vercel frontend

Add this environment variable in the Vercel project, then redeploy:

```text
VITE_API_URL=https://your-whattech-api.onrender.com
```

For local development, copy `backend/.env.example` to `backend/.env`, run `npm install --prefix backend` once, then run `npm run dev:backend` and `npm run dev` in separate terminals. The frontend automatically uses `http://localhost:3001` in development when `VITE_API_URL` is not set.

The API uses parameterized PostgreSQL queries, input constraints, a honeypot, rate limits, strict CORS, security headers, a bounded connection pool, and indexed forum queries. Visitors currently post using a display name; their questions and responses are persisted for everyone.

New questions and responses receive a private deletion token that is saved only in the creator's browser. The database stores a one-way hash of that token, and the API requires the token before deleting content. Because the forum does not require accounts, deletion access does not transfer to another browser and cannot be restored after local browser storage is cleared.

## Quality checks

```bash
npm run build
npm run lint
```

Catalog data, search, compatibility logic, tool calculations, persistence, and analytics live outside UI components. Persistence uses versioned browser storage. Reference values are not live marketplace prices. Update `public/sitemap.xml`, `public/robots.txt`, and the Open Graph metadata with the final public domain before launch.
