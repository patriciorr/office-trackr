#!/bin/bash

pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "ts-node" 2>/dev/null
sleep 1

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
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

cleanup() {
  echo "Closing processes..."
  [[ -n "$BACKEND_PID" ]] && kill $BACKEND_PID 2>/dev/null
  [[ -n "$FRONTEND_PID" ]] && kill $FRONTEND_PID 2>/dev/null
  wait
}
trap cleanup EXIT

(cd backend && npm install && npm run dev &) 
BACKEND_PID=$!
(cd frontend && npm install && npm run dev &)
FRONTEND_PID=$!

wait