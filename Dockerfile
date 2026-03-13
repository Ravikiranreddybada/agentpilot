FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

RUN npm install --omit=dev

# Copy backend source
COPY backend/ .

# Create public folder for static files
RUN mkdir -p public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "app.js"]
