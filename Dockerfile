# Use Node.js LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port (Cloud Run will set $PORT)
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
