FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN npx medusa build

RUN ls -la /app/.medusa/server/ && ls -la /app/.medusa/server/public/ 2>/dev/null || echo "WARNING: no public dir"

EXPOSE 9000

CMD npx medusa db:migrate && node /app/.medusa/server/index.js
