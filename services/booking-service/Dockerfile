FROM node:18-alpine

WORKDIR /app

COPY services/booking-service/package*.json ./
RUN npm install --omit=dev

COPY services/booking-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3002

CMD ["node", "server.js"]
