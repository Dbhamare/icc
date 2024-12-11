# Use the official Node.js image as a base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port your app is listening on
EXPOSE 5000

# Run the application
CMD ["npm", "start"]

