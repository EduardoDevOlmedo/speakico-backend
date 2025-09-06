FROM node:18

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy everything else
COPY . .


# Expose the port Cloud Run expects
ENV PORT 8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
