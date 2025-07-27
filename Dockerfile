# Dockerfile
FROM ubuntu:jammy AS base

# 1) Install runtime deps (Node, Yarn, libcairo, ffmpeg, etc.)
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg nodejs yarn unzip git ffmpeg \
      libgfortran5 libgbm1 tzdata && \
    rm -rf /var/lib/apt/lists/*

# 2) Create non‑root user
ARG ARG_UID=1000
ARG ARG_GID=1000
RUN groupadd --gid "$ARG_GID" anythingllm && \
    useradd --uid "$ARG_UID" --gid "$ARG_GID" --create-home \
            --shell /bin/bash anythingllm

# 3) Copy in everything (including docker-entrypoint.sh + .env example)
WORKDIR /app
COPY --chown=anythingllm:anythingllm . .

# 4) Install & build as that user
USER anythingllm

# 4a) Install all workspace deps
RUN yarn install --network-timeout 100000

# 4b) Build the frontend
RUN cd frontend && yarn build --network-timeout 100000

# 5) Prepare storage & env for the server
USER root
ENV STORAGE_DIR=/app/server/storage
RUN mkdir -p "$STORAGE_DIR" && \
    cp /app/docker/.env.example /app/server/.env && \
    chown -R anythingllm:anythingllm /app/server/storage /app/server/.env

# 6) Make entrypoints executable
RUN chmod +x /app/docker/docker-entrypoint.sh /app/docker/docker-healthcheck.sh

# 7) Final settings
USER anythingllm
ENV NODE_ENV=production \
    ANYTHING_LLM_RUNTIME=docker \
    DEPLOYMENT_VERSION=1.8.4

# 8) Expose both the HTTP server and the collector
EXPOSE 3001 8888

# 9) Kick off the built‑in entrypoint
ENTRYPOINT ["/app/docker/docker-entrypoint.sh"]
