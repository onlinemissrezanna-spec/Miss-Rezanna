# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production for smaller image size)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5005

# Define the command to run the app using PM2 (assuming PM2 is installed globally in the final image or we just use node)
# For enterprise, we use pm2-runtime
RUN npm install pm2 -g

CMD ["pm2-runtime", "ecosystem.config.js"]
