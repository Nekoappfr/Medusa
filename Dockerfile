FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN npx medusa build

RUN test -f /app/.medusa/server/public/admin/index.html || (echo "ERROR: admin index.html missing after build" && exit 1)

EXPOSE 9000

CMD npx medusa db:migrate && npx medusa start
