#!/bin/bash

# Start backend server
cd /workspaces/Under-Delta-Tale-Rune-Fight-Sim/backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend HTTP server
cd /workspaces/Under-Delta-Tale-Rune-Fight-Sim
python3 -m http.server 8080 &
FRONTEND_PID=$!

echo "Backend server running on http://localhost:3000"
echo "Frontend server running on http://localhost:8080"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
