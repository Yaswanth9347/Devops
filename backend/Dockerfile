FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV DATABASE_URL=sqlite:///./dev.db

COPY . .

EXPOSE 5000

CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "5000"]
