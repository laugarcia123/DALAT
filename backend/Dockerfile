FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar drivers si hiciera falta
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requerimientos e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el codigo del backend
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 8000

# Comando para ejecutar Uvicorn en produccion
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
