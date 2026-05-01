FROM node:24-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p public/data

# Expose Vite dev server port
EXPOSE 5173

# Environment
ENV NODE_ENV=development

# Start Vite dev server with host 0.0.0.0 for Docker access
CMD ["npm", "run", "dev:vite", "--", "--host", "0.0.0.0"]
