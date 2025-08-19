# OfficeTrackr

OfficeTrackr is a fullstack calendar and event management platform designed for modern teams. It features a visual calendar, role-based dashboards, and secure authentication, making it ideal for managing office days, remote work, and vacations.

## Features
- Visual calendar for coworkers and managers
- JWT authentication and role-based access (admin, manager, coworker)
- Manager dashboard for team insights
- Admin panel for user and event management
- Secure REST API with Express and MongoDB

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB

## Project Structure
- `/frontend` — React application
- `/backend` — Node.js/Express API

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)

## How to Run

### Option 1: Using Shell Commands (Local Development)

#### Frontend
```sh
cd frontend
npm install
npm run dev
```

#### Backend
```sh
cd backend
npm install
npm run dev
```

#### Environment Variables
Create a `.env` file in `/backend` with your MongoDB URI and JWT secret:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

### Option 2: Using Docker Compose

This will start both the backend and a MongoDB instance automatically (if configured in `docker-compose.yml`).

```sh
docker-compose up
```

You can configure environment variables in the `docker-compose.yml` or use a `.env` file as needed.

## Security & Best Practices
- **Never commit `.env` or files with secrets.**
- Sensitive files and folders (like `logs/`, `.env`, `node_modules/`) are already excluded via `.gitignore`.
- Always review `.gitignore` before pushing to GitHub.
- Use environment variables for credentials and secrets.

## License
MIT
