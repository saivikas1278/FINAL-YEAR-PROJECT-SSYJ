# FastAPI Backend

This is the backend service for the Developer Role Prediction system.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
