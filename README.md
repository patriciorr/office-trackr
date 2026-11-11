<div align="center">

# 📅 OfficeTrackr

**A modern, full-stack hybrid workplace & event management platform.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTk3cHgiIGhlaWdodD0iMTk3cHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIj4KCTxjaXJjbGUgY3g9Ijk4IiBjeT0iOTgiIHI9Ijk4IiBmaWxsPSJibGFjayIvPgoJPGNpcmNsZSBjeD0iOTgiIGN5PSI5OCIgcj0iNzgiIGZpbGw9IndoaXRlIi8+Cgk8Y2lyY2xlIGN4PSI5OCIgY3k9Ijk4IiByPSI1NSIgZmlsbD0iYmxhY2siLz4KCTxjaXJjbGUgY3g9Ijk4IiBjeT0iOTgiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPgoJPHJlY3QgeD0iMTE1IiB5PSI4NSIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjI1IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=)](./LICENSE)

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
- 🐳 **Full-Stack Docker Orchestration:** Complete multi-container setup (Nginx Frontend, NodeJS Backend, Mongo Database) managed via Docker Compose.

---

## 🛠️ Tech Stack

### Frontend

| Technology            | Badge                                                                                               | Purpose                                   |
| :-------------------- | :-------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| **React**             | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | Dynamic Single Page Application (SPA)     |
| **Vite**              | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)     | Ultra-fast build tool and dev server      |
| **Material UI (MUI)** | ![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)        | Elegant UI component system and styling   |
| **Nginx**             | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)  | Reverse proxy & static content web server |

### Backend & Database

| Technology  | Badge                                                                                                          | Purpose                                   |
| :---------- | :------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| **Node.js** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)     | JavaScript runtime engine                 |
| **Express** | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | RESTful API backend framework             |
| **MongoDB** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)       | NoSQL document database                   |
| **JWT**     | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)   | Token-based session management            |
| **Docker**  | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)          | Multi-container environment orchestration |

---

## 📁 Project Structure

```text
office-trackr/
├── 📂 frontend/            # React + Vite client app
│   ├── 📂 src/             # Components, pages, context, and styles
|   ├── 📂 test/            # Unit, integration and e2e tests
│   ├── 📄 Dockerfile       # Frontend container image definition
│   ├── 📄 package.json     # Client dependencies
│   ├── 📄 nginx.conf       # Nginx reverse proxy routing
│   └── 📄 vite.config.js   # Vite configuration
├── 📂 backend/             # Node.js + Express REST API
│   ├── 📂 src/             # Controllers, models, routes, middleware
|   ├── 📂 test/            # Unit, integration and e2e tests
│   ├── 📄 Dockerfile       # Backend container image definition
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
- **Docker Desktop** / **Docker Engine**: `v24.0+`
- **Docker Compose**: `v2.20+`

---

### 🐳 Quick Start with Docker Compose (Recommended)

Launch the entire stack (Nginx, React, NodeJS and MongoDB) with a single command:

#### 1. Clone the Repository

```bash
git clone https://github.com/patriciorr/office-trackr.git
cd office-trackr
```

#### 2. Start the Containers

```bash
docker compose up -d --build
```

#### 3. Access the Platform

- **Web Application:** `http://localhost`
- **REST API:** `http://localhost:5000`
- **MongoDB:** `http://localhost:27017`

#### 4. Stop the Containers

```bash
docker compose down
```

---

### 💻 Local Development Setup

Run the script `start-dev.sh` once you clone the repository to start the development server

```bash
sh start-dev.sh
```

If not, you can follow these steps

#### 1. Clone the Repository

```bash
git clone https://github.com/patriciorr/office-trackr.git
cd office-trackr
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

> [!NOTE]
> This is the MongoDB connection URL
> `mongodb://officetrackruser:officetrackrpass@localhost:27017/office-trackr?authSource=office-trackr`

_To clean up and remove the Docker container & volume:_

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

Access the app at `http://localhost:5173` and the API at `http://localhost:5000`.

---

## Railway temporary deployment

This setup is intended for a short demonstration with fictional data, not production. Use a Railway project with
three services in the same environment: `frontend`, `backend`, and MongoDB. Only the frontend should have a public
domain. Railway charges for resource use; monitor the available trial or Free credits.

1. Connect the repository and `main` in Railway. Add the Railway MongoDB template, keep public access disabled,
   and confirm that its volume is mounted at `/data/db`. MongoDB must use a persistent volume to survive redeployments.
2. Add a backend service from the repository with root directory `/backend` and its Dockerfile. Configure:
   - `MONGO_URI`: reference the MongoDB service's private `MONGO_URL` variable.
   - `MONGO_DB_NAME`: `office-trackr`.
   - `JWT_SECRET`: a new, long random secret.
   - `PORT`: `5000`.
   - `NODE_ENV`: `production`.
   - `DISABLE_REGISTRATION`: `true`.
   Do not assign a public domain or TCP proxy to this service.
3. To initialize the two accounts on the first startup, temporarily set `BOOTSTRAP_USERS=true` and set
   `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_COWORKER_EMAIL`, and
   `BOOTSTRAP_COWORKER_PASSWORD` in the backend service. Use different email addresses and unique passwords that satisfy
   the application's password validation. The bootstrap requires registration to be disabled and never overwrites an
   existing account; an existing account with an unexpected role stops startup. Remove all five bootstrap variables
   after confirming both accounts can log in. Never commit the credentials or use the local Docker demo accounts.
4. Add a frontend service with root directory `/frontend` and its Dockerfile. Set `VITE_DISABLE_REGISTRATION=true`
   for the build, `BACKEND_HOST` to a Railway variable reference to the backend's `RAILWAY_PRIVATE_DOMAIN`, and
   `BACKEND_PORT=5000`. Create a Railway public domain targeting port `80`. The Nginx proxy forwards `/api/` and
   `/socket.io/` over the private network; it resolves the backend hostname again after deployments.
5. Enable automatic deployment from `main`. Verify both logins, calendar operations, disabled registration,
   role restrictions, and persistence after restarting MongoDB. Check service logs and the Railway usage dashboard.
6. When the demonstration is finished, stop the deployments. Delete the volume and services only when the test data is
   no longer needed.

Railway's private network and MongoDB template are documented at
[Private Networking](https://docs.railway.com/networking/private-networking) and
[MongoDB](https://docs.railway.com/databases/mongodb).

---

## CI and release workflow

Develop on `develop` (or merge feature branches into it), then open a pull request from `develop` to `main`.
The GitHub Actions CI workflow builds both applications and runs the backend unit, integration and E2E tests, frontend
unit and integration tests, and Cypress against an isolated Docker stack. Protect `main` with a pull-request rule and
require the `Backend`, `Frontend`, and `Cypress` checks before merging. Railway deploys `main` automatically after
the merge. As this is a single-maintainer repository, pull requests do not require a separate approval. The existing
CODEOWNERS assignment and signed-commit requirement remain in place.

Run the same suites locally with `npm test` in `backend`, and `npm test` in `frontend`. Docker is required for the
backend integration and E2E tests and for Cypress. The Cypress runner uses its own Compose project and a dynamically
assigned localhost port.

---

## 🔑 Test Credentials

The database initializes with demo user accounts to test each role:

| Role         | Email              | Password       | Access Level                      |
| :----------- | :----------------- | :------------- | :-------------------------------- |
| **Admin**    | `admin@test.com`   | `Patricio@123` | Full administrative control       |
| **Manager**  | `manager@test.com` | `Patricio@123` | Team calendar & dashboard metrics |
| **Coworker** | `johndoe@test.com` | `Patricio@123` | Personal schedule logging         |
| **Coworker** | `janedoe@test.com` | `Patricio@123` | Personal schedule logging         |

---

## 🔒 Security & Best Practices

- 🔐 **Environment Variables:** Credentials and secrets are managed via `.env` files and never committed to version control.
- 🛡️ **Git Hygiene:** Sensitive files, dependency logs, and build artifacts (`/node_modules`, `dist/`, `.env`) are excluded in `.gitignore`.
- 🔑 **Token Authorization:** Stateless JWT-based header authentication protects restricted REST endpoints.

---

## 📜 License & Usage Restrictions

<div align="center">

Copyright (c) 2026 Patricio Rodríguez Ramírez. All rights reserved.

</div>

**1. PROPRIETARY RIGHTS & RESTRICTIONS**
This source code and its associated files are the exclusive property of Patricio Rodríguez Ramírez. Unauthorized copying, modification, distribution, sublicensing, or commercial/non-commercial use of this software, via any medium, is strictly prohibited without explicit written permission from the copyright owner, except as permitted under the GitHub Terms of Service.

**2. CONTRIBUTIONS AND PULL REQUESTS**
By submitting any contribution to this repository (including but not limited to pull requests, patches, bug fixes, suggestions, or code modifications), you hereby grant Patricio Rodríguez Ramírez a perpetual, irrevocable, worldwide, non-exclusive, royalty-free, fully paid-up, transferable, and sublicensable license to use, reproduce, modify, adapt, publish, perform, display, distribute, sell, offer for sale, import, and commercialize such contributions under any terms or licenses, present or future.
You represent and warrant that you are the sole author of the contribution or possess all necessary legal rights and authority to grant the rights and licenses specified herein.

**3. DISCLAIMER OF WARRANTY**
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">
  <sub>Built with ❤️ by Patricio Rodríguez.</sub>
</div>
