FROM node:20-alpine

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

RUN npm install

# Copy backend source code
COPY backend/ ./

RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
