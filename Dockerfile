FROM node:24-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Create data directory
RUN mkdir -p public/data

# Expose port
EXPOSE 5176

# Default environment
ENV NODE_ENV=development

# Run startup script (downloads data + starts service + dev server)
CMD ["npm", "run", "dev"]
