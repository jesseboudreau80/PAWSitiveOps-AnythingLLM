#!/bin/bash
# This is the entrypoint for Render.com docker builds. Do not use for targeting
# in other service docker builds

# Ensure necessary storage subdirectories exist
mkdir -p "$STORAGE_DIR/assets"
mkdir -p "$STORAGE_DIR/documents/custom-documents"
mkdir -p "$STORAGE_DIR/models"
mkdir -p "$STORAGE_DIR/vector-cache"

echo "Initializing database file..."
touch "$STORAGE_DIR/anythingllm.db"

echo "Copying pre-built assets into storage dir (if any)..."
if [ -d "/app/server/storage/assets" ]; then
  echo "Assets directory found; copying to $STORAGE_DIR/assets"
  cp -r "/app/server/storage/assets/" "$STORAGE_DIR/assets"
  echo "Assets copied successfully."
else
  echo "No assets directory found at /app/server/storage/assets; skipping copy."
fi

# Start server
{
  cd /app/server/ && \
  echo "Running Prisma generate and migrations..." && \
  npx prisma generate --schema=./prisma/schema.prisma && \
  npx prisma migrate deploy --schema=./prisma/schema.prisma && \
  echo "Starting server..." && \
  node /app/server/index.js
} &

# Start collector
{
  echo "Starting collector..." && \
  node /app/collector/index.js
} &

# Wait for either process to exit and forward its exit code
wait -n
exit $?
