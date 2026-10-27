# Employee-Management-System

## Deployment

The frontend and API are separate applications. Set the Vercel project's root directory to `frontend` and deploy it as a Vite app. Deploy `server` as a Node.js service (build command: `npm install`, start command: `npm start`) that can connect to MongoDB.

Configure these environment variables:

- **API service:** `MONGODB_URI` and `JWT_KEY`. Set these in the hosting provider's environment settings; production startup does not require a `.env` file.
- **Vercel frontend:** `VITE_API_URL` set to the API service's public origin, for example `https://your-api.example.com` (do not add `/api`).

Redeploy the frontend after setting `VITE_API_URL`; Vite embeds it at build time. Without it, API requests use the same origin, which works with the local Vite proxy but not with a frontend-only Vercel deployment. The API root (`https://your-api.example.com/`) returns a small JSON health response. The frontend is served at `/` and `/login`.

To create an administrator, follow the setup steps in [server/README.md](./server/README.md). Public sign-up creates employee accounts only.