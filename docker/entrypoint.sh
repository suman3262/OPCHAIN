#!/bin/sh
set -e

echo "[OPCHAIN] Starting..."
mkdir -p /app/runtime/evidence

# Run alembic migrations if alembic.ini exists
if [ -f /app/alembic.ini ]; then
    echo "[OPCHAIN] Running migrations..."
    alembic upgrade head
fi

echo "[OPCHAIN] Launching server on port 8080"
exec uvicorn main:app --host 0.0.0.0 --port 8080 --workers 1
