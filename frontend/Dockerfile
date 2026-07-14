# Stage 1: Build React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve the production bundle using Nginx
FROM nginx:alpine

# Copy built files from the previous stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
