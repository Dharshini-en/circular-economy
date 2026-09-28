# AI-Based Predictive Service Scheduling System Using Windchill PLM

## Overview
A full-stack industrial dashboard and AI prediction system for gearbox maintenance scheduling. It simulates a PLM-style application with predictive analytics, usage entry, product registration, and maintenance history.

## Tech Stack
- Frontend: React, Tailwind CSS, React Router, React Icons, Chart.js
- Backend: Python Flask, Flask-JWT-Extended, Flask-CORS
- Database: MySQL

## Project Structure
- `backend/`: Flask API, prediction logic, SQL schema, dataset generation
- `frontend/`: React dashboard client built with Vite and Tailwind

## Setup
1. Copy `.env.example` to `.env` in the project root. Set `MYSQL_PASSWORD` for your MySQL account and replace `JWT_SECRET_KEY` with a generated secret. Generate one with:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Keep `.env` private; it is excluded from Git.
2. Install backend dependencies:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   ```
3. Create the MySQL schema and load sample data:
   ```bash
   python db_init.py
   ```
4. Run the backend:
   ```bash
   python app.py
   ```
5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Run as a single app on Windows
1. Install Python and Node.js on the computer that will host the dashboard.
2. Copy the project folder to that computer and run `deploy.bat` from the project root.
3. Open `http://localhost:8080` on the host computer. On another computer on the same network, open `http://<host-ip>:8080`.
4. Keep the deployment window open. Allow port 8080 through Windows Firewall for private networks if prompted.

## Features
- Login / Register
- Dashboard with KPI cards, charts, alerts, and AI recommendations
- Product registration with CAD/BOM upload placeholders
- Usage data entry
- Product details and maintenance history
- Prediction endpoint with health score, remaining life, and priority
- IoT placeholder API for future sensor integration

## Notes
- The dataset generator creates 1000 synthetic gearbox records.
- Predictions and score calculations are included in `backend/prediction.py`.
- Tailwind CSS and React components are styled for a professional industrial dashboard look.
