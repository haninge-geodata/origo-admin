FROM node:22-alpine AS build
WORKDIR /build

COPY ./proxy/package*.json ./
COPY ./proxy/tsconfig.json ./
RUN npm ci
COPY ./proxy/src/ ./src/
RUN npx tsc

FROM node:22-alpine
WORKDIR /app

COPY --from=build /build/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /build/dist ./dist

EXPOSE 3020

CMD ["node", "dist/server.js"]
