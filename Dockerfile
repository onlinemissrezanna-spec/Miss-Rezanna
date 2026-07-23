FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install without running postinstall scripts
RUN npm install --ignore-scripts

# Copy all backend source code (including prisma/)
COPY backend/ ./

# Now generate Prisma client (schema.prisma is available)
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/server.js"]
