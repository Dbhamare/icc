# Step 1: Build the frontend using Node.js
FROM node:16-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code into the container
COPY . .

# Build the frontend app
RUN npm run build

# Step 2: Serve the built app using Nginx
FROM nginx:alpine

# Copy the custom nginx.conf file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build folder from the previous build stage into the Nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default port)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
