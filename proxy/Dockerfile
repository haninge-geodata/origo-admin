# Byggsteg för proxyapplikation
FROM node:18-alpine AS proxy-build
WORKDIR /proxy

# Argument för miljövariabler
ARG NODE_ENV
ARG PORT=3020

# Använd ARG för att sätta ENV
ENV NODE_ENV=${NODE_ENV} \
    PORT=${PORT}

COPY ./proxy/package*.json ./
COPY ./proxy/tsconfig.json ./
RUN npm ci
COPY ./proxy/ ./
RUN npm run build

# Slutlig körningsbar container
FROM node:18-alpine
WORKDIR /app
COPY --from=proxy-build /proxy/dist ./dist
COPY --from=proxy-build /proxy/node_modules ./node_modules
COPY --from=proxy-build /proxy/tsconfig.json /app/tsconfig.json

# Exponera porten din proxy lyssnar på
EXPOSE 3020

# Startkommando
CMD ["node", "dist/server.js"]
