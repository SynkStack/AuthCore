FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Copy dependency files first: Docker reuses this cached layer until they change.
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Run as the unprivileged "node" user that ships with the image, not as root.
USER node

EXPOSE 3000

# Docker marks the container "unhealthy" if /health stops answering.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]