FROM node:18-alpine

WORKDIR /app

COPY services/notification-service/package*.json ./
RUN npm install --omit=dev

COPY services/notification-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3005

CMD ["node", "server.js"]
