FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/backend

COPY requirements.txt ./backend/

WORKDIR /app/backend

RUN pip install --upgrade pip && pip install -r requirements.txt

WORKDIR /app

COPY main.py ./backend/

RUN mkdir -p ./backend/database

RUN mkdir -p ./backend/backend

RUN mkdir -p ./backend/api

COPY database ./backend/database

COPY app ./backend/app

COPY api ./backend/api

EXPOSE 8000

WORKDIR /app/backend

ENV PYTHONPATH=/app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]