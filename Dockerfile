# Use Node.js LTS
FROM node:18

WORKDIR /usr/src/app

# Copy dependencies
COPY package*.json ./
RUN npm install --production

# Copy app code
COPY . .

# Optional: document the port your app listens on
ENV PORT 8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
