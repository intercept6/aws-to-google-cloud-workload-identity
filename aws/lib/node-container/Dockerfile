FROM node:bookworm-slim as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm clean-install
COPY . .
RUN npm run build

CMD ["node", "/app/dist/index.js"]