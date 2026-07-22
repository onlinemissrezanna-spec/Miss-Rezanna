FROM node:20-alpine

# Install openssl which is required by Prisma
RUN apk update && apk add openssl

WORKDIR /app

# Copy the entire project
COPY . .

# Navigate to backend, install dependencies and generate Prisma client
RUN cd backend && npm install
RUN cd backend && npx prisma generate

# Expose port 5000
EXPOSE 5000

# Start the Node.js server from the backend folder
CMD cd backend && npx prisma db push --accept-data-loss && node src/server.js
