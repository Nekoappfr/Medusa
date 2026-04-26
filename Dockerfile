FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN npx medusa build

EXPOSE 9000

CMD npx medusa db:migrate && npx medusa start
