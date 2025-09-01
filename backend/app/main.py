# backend/app/main.py

from fastapi import FastAPI

# crate FastAPI instance

app = FastAPI()

# define a root endpoint
@app.get("/")
def read_root():
    return{"message": "Welcome to the FastAPI application!"}