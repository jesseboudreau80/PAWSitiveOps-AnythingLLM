#############################################
#                               BASE IMAGE
#############################################
FROM ubuntu:jammy-20240627.1 AS base

# 1) Runtime storage dir for SQLite (or anything else)  
ENV STORAGE_DIR=/tmp/storage  
RUN mkdir -p "$STORAGE_DIR" && chmod 777 "$STORAGE_DIR"

# 2) Build‑time user/group args  
ARG ARG_UID=1000  
ARG ARG_GID=1000  

#############################################
#                         BUILD FOR ARM64
#############################################
FROM base AS build-arm64
RUN echo "Building for ARM64..."

SHELL ["/bin/bash","-o","pipefail","-c"]

# system deps + node + yarn + uvx  
RUN DEBIAN_FRONTEND=noninteractive apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      unzip curl gnupg libgfortran5 libgbm1 tzdata netcat \
      libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
      libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
      libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release \
      xdg-utils git build-essential ffmpeg \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
      | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" \
      | tee /etc/apt/sources.list.d/nodesource.list \
 && apt-get update \
 && apt-get install -yq --no-install-recommends nodejs \
 && curl -LO https://github.com/yarnpkg/yarn/releases/download/v1.22.19/yarn_1.22.19_all.deb \
 && dpkg -i yarn_1.22.19_all.deb && rm yarn_1.22.19_all.deb \
 && curl -LsSf https://astral.sh/uv/0.6.10/install.sh | sh \
 && mv /root/.local/bin/uv /usr/local/bin/uv && mv /root/.local/bin/uvx /usr/local/bin/uvx \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# create app user & dirs  
RUN groupadd -g "$ARG_GID" anythingllm \
 && useradd -l -u "$ARG_UID" -m -d /app -s /bin/bash -g anythingllm anythingllm \
 && mkdir -p /app/{frontend,server,collector} \
 && chown -R anythingllm:anythingllm /app

# copy helper scripts  
COPY --chown=anythingllm:anythingllm docker/docker-entrypoint.sh /usr/local/bin/  
COPY --chown=anythingllm:anythingllm docker/docker-healthcheck.sh /usr/local/bin/  
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-healthcheck.sh  

USER anythingllm  
WORKDIR /app  

# patch Puppeteer for ARM64 chromium  
RUN echo "Installing ARM64 Chromium…" \
 && curl -sSL https://playwright.azureedge.net/builds/chromium/1088/chromium-linux-arm64.zip -o chrome-linux.zip \
 && unzip chrome-linux.zip && rm chrome-linux.zip

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  
ENV CHROME_PATH=/app/chrome-linux/chrome  
ENV PUPPETEER_EXECUTABLE_PATH=/app/chrome-linux/chrome  

#############################################
#                        BUILD FOR AMD64
#############################################
FROM base AS build-amd64
RUN echo "Building for AMD64…"

SHELL ["/bin/bash","-o","pipefail","-c"]

# same deps as above (minus unzip & ARM patch)  
RUN DEBIAN_FRONTEND=noninteractive apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
      curl gnupg libgfortran5 libgbm1 tzdata netcat \
      libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
      libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
      libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release \
      xdg-utils git build-essential ffmpeg \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
      | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" \
      | tee /etc/apt/sources.list.d/nodesource.list \
 && apt-get update \
 && apt-get install -yq --no-install-recommends nodejs \
 && curl -LO https://github.com/yarnpkg/yarn/releases/download/v1.22.19/yarn_1.22.19_all.deb \
 && dpkg -i yarn_1.22.19_all.deb && rm yarn_1.22.19_all.deb \
 && curl -LsSf https://astral.sh/uv/0.6.10/install.sh | sh \
 && mv /root/.local/bin/uv /usr/local/bin/uv && mv /root/.local/bin/uvx /usr/local/bin/uvx \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd -g "$ARG_GID" anythingllm \
 && useradd -l -u "$ARG_UID" -m -d /app -s /bin/bash -g anythingllm anythingllm \
 && mkdir -p /app/{frontend,server,collector} \
 && chown -R anythingllm:anythingllm /app

COPY --chown=anythingllm:anythingllm docker/docker-entrypoint.sh /usr/local/bin/  
COPY --chown=anythingllm:anythingllm docker/docker-healthcheck.sh /usr/local/bin/  
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-healthcheck.sh  

#############################################
#                COMMON BUILD FLOW
#############################################
FROM build-${TARGETARCH} AS build
SHELL ["/bin/bash","-o","pipefail","-c"]
USER anythingllm
WORKDIR /app

# frontend
FROM build AS frontend-build
COPY --chown=anythingllm:anythingllm frontend /app/frontend
WORKDIR /app/frontend
RUN yarn install --network-timeout 100000 && yarn cache clean \
 && yarn build \
 && mv dist /tmp/frontend-build \
 && rm -rf * \
 && mv /tmp/frontend-build dist

# backend
FROM build AS backend-build
COPY --chown=anythingllm:anythingllm server /app/server
WORKDIR /app/server
RUN yarn install --production --network-timeout 100000 && yarn cache clean

# collector
WORKDIR /app
COPY --chown=anythingllm:anythingllm collector /app/collector
WORKDIR /app/collector
ENV PUPPETEER_DOWNLOAD_BASE_URL=https://storage.googleapis.com/chrome-for-testing-public
RUN yarn install --production --network-timeout 100000 && yarn cache clean

#############################################
#               FINAL PRODUCTION IMAGE
#############################################
FROM backend-build AS production-build

# copy in built frontend
COPY --chown=anythingllm:anythingllm --from=frontend-build /app/frontend/dist /app/server/public

USER root
RUN chown -R anythingllm:anythingllm /app/server /app/collector
USER anythingllm
WORKDIR /app

ENV NODE_ENV=production  
ENV ANYTHING_LLM_RUNTIME=docker  
ENV DEPLOYMENT_VERSION=1.8.4  

HEALTHCHECK --interval=1m --timeout=10s --start-period=1m \
  CMD ["bash","/usr/local/bin/docker-healthcheck.sh"] || exit 1

ENTRYPOINT ["/bin/bash","/usr/local/bin/docker-entrypoint.sh"]

# tell Docker/Render which port(s) you listen on:
EXPOSE 8888
