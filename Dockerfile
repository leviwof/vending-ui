FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
RUN npm install
COPY . .
RUN npm --workspace apps/frontend run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/frontend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
