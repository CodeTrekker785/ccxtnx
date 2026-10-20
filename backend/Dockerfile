FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package.json ./package.json
RUN npm install --omit=dev
COPY backend/src ./src
EXPOSE 8787
CMD ["node", "src/server.js"]
