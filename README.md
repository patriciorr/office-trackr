<div align="center">

# 📅 OfficeTrackr

**A modern, full-stack hybrid workplace & event management platform.**

[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg?logo=creative-commons&logoColor=white)](https://creativecommons.org/licenses/by-nc-nd/4.0/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [Test Credentials](#-test-credentials) • [License](#-license--usage-restrictions)

</div>

---

## 📖 Overview

**OfficeTrackr** is an intuitive, full-stack calendar and event management solution tailored for modern hybrid and remote teams. It simplifies office capacity planning, remote work tracking, leave/vacation management, and team visibility with visual calendars, role-based dashboards, and robust security.

---

## ✨ Key Features

- 🗓️ **Interactive Visual Calendar:** Easily check coworker presence, remote days, and upcoming vacations at a glance.
- 🔐 **Role-Based Access Control (RBAC):**
  - 👤 **Coworker:** Log office presence, schedule remote work, and manage personal calendar events.
  - 👔 **Manager:** Access team analytics, monitor office attendance, and review team schedules.
  - ⚙️ **Admin:** Manage users, assign roles, configure global settings, and audit platform events.
- 🔑 **Secure Authentication:** JWT token authentication with bcrypt password hashing.
- 📊 **Manager Insights Dashboard:** Real-time visibility into team availability and office density.
- ⚡ **RESTful API Architecture:** Scalable Node.js + Express backend integrated with MongoDB.
- 🐳 **Docker-Ready Workflow:** Rapid setup for database initialization and local environment deployment.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **React** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | Dynamic Single Page Application (SPA) |
| **Vite** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | Ultra-fast build tool and dev server |
| **JavaScript / JSX** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | Modern ES6+ application logic |

### Backend & Database
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **Node.js** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | JavaScript runtime engine |
| **Express** | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | RESTful API backend framework |
| **MongoDB** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) | NoSQL document database |
| **JWT** | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) | Token-based session management |
| **Docker** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) | Containerized database environment |

---

## 📁 Project Structure

```text
officetrackr/
├── 📂 frontend/            # React + Vite client app
│   ├── 📂 src/             # Components, pages, context, and styles
|   ├── 📂 test/            # Unit, integration and e2e tests
│   ├── 📄 package.json     # Client dependencies
│   └── 📄 vite.config.js   # Vite configuration
├── 📂 backend/             # Node.js + Express REST API
│   ├── 📂 src/             # Controllers, models, routes, middleware
|   ├── 📂 test/            # Unit, integration and e2e tests
│   ├── 📄 .env             # Environment configuration (git-ignored)
│   └── 📄 package.json     # Server dependencies
├── 📄 mongo-init.js        # MongoDB seed data script
├── 📄 docker-compose.yml   # Docker orchestration file
└── 📄 README.md            # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Docker Desktop**: (for running MongoDB locally)

---

### 💻 Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/patriciorr/office-trackr.git
cd officetrackr
```

#### 2. Start Database (Docker)
Run the following command to launch a pre-populated **MongoDB 7** container:

```bash
docker run -d \
  --name office-trackr-mongo \
  --restart always \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=example \
  -e MONGO_INITDB_DATABASE=office-trackr \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  -v "$(pwd)/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro" \
  mongo:7
```

> **MongoDB Connection URI:**
> `mongodb://officetrackruser:officetrackrpass@localhost:27017/office-trackr?authSource=office-trackr`

*To clean up and remove the Docker container & volume:*
```bash
docker rm -f -v office-trackr-mongo && docker volume rm mongo_data
```

#### 3. Configure Environment Variables
Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://officetrackruser:officetrackrpass@localhost:27017/office-trackr?authSource=office-trackr
JWT_SECRET=your_jwt_secret_key_here
```

#### 4. Run Backend
```bash
cd backend
npm install
npm run dev
```

#### 5. Run Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Access the app at `http://localhost:3000` and the API at `http://localhost:5000`.

---

### 🐳 Option 2: Docker Compose Setup (To Be Improved)

If you have a `docker-compose.yml` file configured, you can launch the full stack in one step:

```bash
docker-compose up -d --build
```

---

## 🔑 Test Credentials

The database initializes with demo user accounts to test each role:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `Patricio@123` | Full administrative control |
| **Manager** | `manager@test.com` | `Patricio@123` | Team calendar & dashboard metrics |
| **Coworker** | `johndoe@test.com` | `Patricio@123` | Personal schedule logging |
| **Coworker** | `janedoe@test.com` | `Patricio@123` | Personal schedule logging |

---

## 🔒 Security & Best Practices

- 🔐 **Environment Variables:** Credentials and secrets are managed via `.env` files and never committed to version control.
- 🛡️ **Git Hygiene:** Sensitive files, dependency logs, and build artifacts (`/node_modules`, `dist/`, `.env`) are excluded in `.gitignore`.
- 🔑 **Token Authorization:** Stateless JWT-based header authentication protects restricted REST endpoints.

---

## 📜 License & Usage Restrictions

<div align="center">

[![CC BY-NC-ND 4.0](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-nd.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

</div>

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** License.

### Summary of Terms:
- 🚫 **Non-Commercial:** You may not use this software, source code, design, or concept for commercial purposes.
- 🚫 **No Derivatives:** You may not alter, transform, build upon, or distribute modified versions of this software.
- 👁️ **Attribution:** You are free to view, download, and test this project for personal evaluation or educational purposes, provided appropriate credit is given to the author.

For full license terms and legal code, visit the [Creative Commons CC BY-NC-ND 4.0 License Portal](https://creativecommons.org/licenses/by-nc-nd/4.0/).

---
<div align="center">
  <sub>Built with ❤️ by Patricio Rodríguez.</sub>
</div>