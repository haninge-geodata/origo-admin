FROM node:22-alpine AS build
WORKDIR /build

COPY ./server/package*.json ./server/
COPY ./server/tsconfig.json ./server/
COPY ./shared/ ./shared/

WORKDIR /build/server
RUN npm ci
COPY ./server/src/ ./src/
COPY ./server/.env.template ./.env.template
RUN npm run build:unix

FROM node:22-alpine
WORKDIR /app

COPY --from=build /build/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /build/server/dist ./dist

EXPOSE 3010

CMD ["node", "dist/server/src/server.js"]
