FROM node:18-alpine

WORKDIR /app

COPY services/driver-service/package*.json ./
RUN npm install --omit=dev

COPY services/driver-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3003

CMD ["node", "server.js"]
