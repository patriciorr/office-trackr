#!/bin/bash

pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "ts-node" 2>/dev/null
sleep 1

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker pull mongo:8.0.5
docker run -d -p 27017:27017 --name office-trackr-mongo mongo:8.0.5

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