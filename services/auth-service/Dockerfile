FROM node:18-alpine

WORKDIR /app

COPY services/auth-service/package*.json ./
RUN npm install --omit=dev

COPY services/auth-service/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 3001

CMD ["node", "server.js"]
