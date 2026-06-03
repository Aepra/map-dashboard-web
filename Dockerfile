FROM node:24-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Environment
ENV NODE_ENV=development

# Start dev server. Geospatial data is read from VITE_DATA_SOURCE_URL.
CMD ["npm", "run", "dev"]
