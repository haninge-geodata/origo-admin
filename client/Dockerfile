FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./client/package.json ./client/package-lock.json* ./

# Definiera bygg-args
ARG BASE_URL
ARG VERSION
ARG UPDATED

# Sätt miljövariabler baserade på bygg-args
ENV NEXT_PUBLIC_BASE_URL=${BASE_URL}
ENV NEXT_PUBLIC_VERSION=${VERSION}
ENV NEXT_PUBLIC_UPDATED=${UPDATED}

RUN echo "BASE_URL set to ${NEXT_PUBLIC_BASE_URL}"
RUN echo "Version set to ${NEXT_PUBLIC_VERSION}"
RUN echo "UPDATED at ${NEXT_PUBLIC_UPDATED}"

RUN touch .env.production
RUN echo "NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}" >> .env.production
RUN echo "NEXT_PUBLIC_VERSION=${NEXT_PUBLIC_VERSION}" >> .env.production
RUN echo "NEXT_PUBLIC_UPDATED=${NEXT_PUBLIC_UPDATED}" >> .env.production
RUN cat .env.production

RUN npm ci
RUN npm i --no-save sharp

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./client/ .
COPY ./shared/ ../shared/

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
