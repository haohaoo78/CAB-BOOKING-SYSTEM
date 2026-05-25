FROM node:18-alpine

WORKDIR /app

COPY services/payment-service/package*.json ./
RUN npm install --omit=dev

COPY services/payment-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3004

CMD ["node", "server.js"]
