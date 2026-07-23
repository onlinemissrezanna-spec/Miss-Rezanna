FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install --ignore-scripts

COPY backend/ ./

RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
