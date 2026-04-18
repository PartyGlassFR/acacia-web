# Use a lightweight version of Node.js
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your proxy code
COPY . .

# Expose the port we set in server.js
EXPOSE 8080

# Start the server
CMD ["npm", "start"]