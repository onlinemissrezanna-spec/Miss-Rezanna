FROM node:20-alpine

WORKDIR /app

# Copy backend package files (build context is repo root)
COPY backend/package*.json ./

RUN npm install --ignore-scripts

# Copy backend source code
COPY backend/ ./

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/server.js"]
