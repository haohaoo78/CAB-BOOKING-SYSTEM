FROM node:18-alpine

WORKDIR /app

COPY api-gateway/package*.json ./
RUN npm install --omit=dev

COPY api-gateway/ .
COPY shared/ /shared/

ENV NODE_PATH=/app/node_modules
RUN mkdir -p logs

EXPOSE 8000

CMD ["node", "server.js"]
