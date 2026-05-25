FROM node:18-alpine

WORKDIR /app

COPY services/location-service/package*.json ./
RUN npm install --omit=dev

COPY services/location-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3006

CMD ["node", "server.js"]
