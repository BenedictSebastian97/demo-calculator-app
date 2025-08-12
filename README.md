# Calculator Application

A simple calculator application with a Python Flask backend and React frontend.

## Features

- Basic arithmetic operations (addition, subtraction, multiplication, division)
- **Calculation History**: Persistent storage of all calculations in PostgreSQL database
- **Data Persistence**: Docker volumes ensure calculation history survives container restarts
- Clean and responsive user interface with history panel
- Error handling for division by zero and invalid inputs
- Real-time calculations via REST API

## Project Structure

```
calculator-app/
├── backend/
│   ├── app.py              # Flask application with calculator API and database models
│   ├── requirements.txt    # Python dependencies (Flask, SQLAlchemy, PostgreSQL)
│   ├── Dockerfile          # Backend container configuration
│   └── .dockerignore       # Backend Docker ignore file
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.js         # Main React component with history functionality
│   │   ├── App.css        # Calculator and history panel styling
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Node.js dependencies
│   ├── Dockerfile          # Frontend container configuration
│   └── .dockerignore       # Frontend Docker ignore file
├── docker-compose.yml      # Multi-service orchestration with database
└── README.md              # This file
```

## Setup and Installation

### Backend (Flask)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Docker Services:
- **PostgreSQL Database**: Runs on port 5432 with persistent volume `postgres_data`
- **Flask Backend**: Runs on port 5000, connects to database
- **React Frontend**: Runs on port 3000, communicates with backend
