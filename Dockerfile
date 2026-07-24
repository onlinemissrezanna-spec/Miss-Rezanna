FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files
COPY package*.json ./

RUN npm install --ignore-scripts

# Copy all repository files (admin.html, index.html, css, js, images, backend)
COPY . ./

# Generate Prisma client
RUN cd backend && npx prisma generate

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
