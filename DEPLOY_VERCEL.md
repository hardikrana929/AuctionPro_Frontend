# Deploy AuctionPro frontend to Vercel

1. Push this frontend folder to a Git repository.
2. Import it into Vercel. Set **Root Directory** to `auction-frontend` if using the combined repository.
3. Build command: `npm run build`; output directory: `dist`.
4. Add environment variable `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`.
5. Add `VITE_SOCKET_URL=https://YOUR-BACKEND-DOMAIN` if the frontend uses Socket.IO.
6. Deploy, then set backend `CLIENT_URL` to the deployed frontend origin.

The frontend can be deployed to Vercel. This backend uses a long-lived Express HTTP server and Socket.IO; do not deploy it as a conventional Vercel serverless function for live bidding. Deploy the backend to a persistent Node host such as Render or Railway, with MongoDB Atlas. Verify WebSocket support and configure `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, and Cloudinary environment variables. Never commit `.env` files.
