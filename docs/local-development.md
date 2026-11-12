# Local development

Use Node.js 24.15 or later within the Node 24 release line and npm. The CI workflow uses Node 24; the current Docker
build images use Node 20 and may emit engine warnings for frontend dependencies.

Clone the repository and enter its directory:

```bash
git clone https://github.com/patriciorr/office-trackr.git
cd office-trackr
```

## With Docker Compose

Install Docker Engine and Docker Compose. Compose bind-mounts the backend source directory into its container, so
install its dependencies on the host first:

```bash
npm --prefix backend ci
docker compose up -d --build
```

The frontend is available at [http://localhost](http://localhost), the backend at `http://localhost:5000`, and
MongoDB at `mongodb://localhost:27017`.

Compose uses development-only credentials and exposes the backend and MongoDB on the host. It initializes the demo
accounts below only when the MongoDB volume is first created. Do not expose this setup to the Internet or use it for
production.

Stop the stack with:

```bash
docker compose down
```

This preserves the local MongoDB volume. Removing the volume permanently deletes its data.

### Local demo accounts

These accounts are seeded by `mongo-init.js` when a new Compose MongoDB volume is initialized:

| Role     | Email              | Password       |
| -------- | ------------------ | -------------- |
| Admin    | `admin@test.com`   | `Patricio@123` |
| Manager  | `manager@test.com` | `Patricio@123` |
| Coworker | `johndoe@test.com` | `Patricio@123` |
| Coworker | `janedoe@test.com` | `Patricio@123` |

These public development credentials must never be used for a deployed application or real data.

## Without Docker

Install [MongoDB Community Server](https://www.mongodb.com/docs/manual/installation/) and start a local instance, for
example in a dedicated terminal:

```bash
mkdir -p "$HOME/.local/share/office-trackr-mongodb"
mongod --dbpath "$HOME/.local/share/office-trackr-mongodb" --bind_ip 127.0.0.1 --port 27017
```

This example has no database authentication and is for local development only. If MongoDB already runs as a service
or requires authentication, use its existing connection URI instead.

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/office-trackr
JWT_SECRET=replace-with-a-long-random-secret
```

Start the backend:

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

In another terminal, start the frontend:

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` and `/socket.io` to the backend on port 5000. Public registration is enabled by default and offers the coworker and manager roles. The MongoDB seed and demo
accounts from Compose are **not** created by this option.

### Initial local administrator

To create an administrator and a coworker in a new local database, stop the backend and temporarily add the following
variables to `backend/.env` before starting it again:

```env
DISABLE_REGISTRATION=true
BOOTSTRAP_USERS=true
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=replace-with-a-strong-password
BOOTSTRAP_COWORKER_EMAIL=coworker@example.com
BOOTSTRAP_COWORKER_PASSWORD=replace-with-a-different-strong-password
```

Use different valid email addresses and unique passwords of at least 12 characters with uppercase and lowercase
letters, a number and a symbol; avoid common passwords. Once both accounts are created, remove all five `BOOTSTRAP_*`
variables and remove `DISABLE_REGISTRATION` (or set it to `false`), then restart the backend. Bootstrap never
overwrites existing accounts. Keep `.env` private and never commit real credentials.

> **Warning:** Do not use the legacy `start-dev.sh` on a shared machine: it stops and removes all Docker containers
> and terminates processes by name. Use the explicit steps above instead.

## Tests

```bash
npm --prefix backend test
npm --prefix frontend test
```

Docker is required for backend integration and end-to-end tests, and for Cypress. Cypress uses an isolated Compose
project and a dynamically assigned localhost port.
