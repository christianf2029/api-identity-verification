FROM node:18-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g typescript

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
