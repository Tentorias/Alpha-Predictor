# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the required code directories and data
COPY backend/app/ ./backend/app/
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY data/ ./data/

# Expose port 8000
EXPOSE 8000

# Run the FastAPI application using uvicorn as a module
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
