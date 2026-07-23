FROM node:20-alpine

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

RUN npm install --ignore-scripts

# Copy backend source code
COPY backend/ ./

RUN npx prisma generate

EXPOSE 5000

# Start server safely - ensure container never crashes if DB push fails or is warming up
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; node src/server.js"]
