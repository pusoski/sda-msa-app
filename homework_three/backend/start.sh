#!/bin/sh

set -e

echo "Starting Python script..."
python /app/backend/app/filters/main.py
echo "Python script completed."

echo "Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload