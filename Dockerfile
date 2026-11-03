FROM node:20-slim

# Install system dependencies needed for native modules and sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including devDependencies needed for building vite & server)
RUN npm install --legacy-peer-deps

# Copy full application source
COPY . .

# Build the Vite frontend and the server bundle for production
ENV NODE_ENV=production
RUN npm run build

# Ensure writable directories exist with proper permissions
RUN mkdir -p public/generated-images public/uploads dist local_storage whatsapp-sessions

# Set default Hugging Face Spaces port
ENV PORT=7860
EXPOSE 7860

# Configure non-root user (Hugging Face Spaces runs as user 1000)
RUN id -u user >/dev/null 2>&1 || useradd -m -u 1000 user && \
    chown -R 1000:1000 /app

USER 1000

CMD ["npm", "start"]
