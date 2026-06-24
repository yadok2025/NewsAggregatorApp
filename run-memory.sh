#!/bin/bash
# Hermes Memory Web — Lanza backend + frontend con vista de memoria

APP_DIR="$HOME/Projects/NewsAggregatorApp"

# Arrancar backend en background
cd "$APP_DIR/server"
nohup node server.js > /tmp/newsaggregator-backend.log 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID

# Esperar a que el backend responda
for i in $(seq 1 10); do
    if curl -s http://localhost:3001/api/memory/stats > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Arrancar frontend en background
cd "$APP_DIR/client"
nohup npm run dev > /tmp/newsaggregator-frontend.log 2>&1 &
FRONTEND_PID=$!
disown $FRONTEND_PID

# Esperar a que el frontend responda
for i in $(seq 1 10); do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Abrir navegador en la página de memoria
xdg-open "http://localhost:5173/memory" 2>/dev/null || sensible-browser "http://localhost:5173/memory" 2>/dev/null || firefox "http://localhost:5173/memory" 2>/dev/null

echo "Hermes Memory Web corriendo:"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173/memory"
echo ""
echo "PIDs: backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Logs: /tmp/newsaggregator-backend.log /tmp/newsaggregator-frontend.log"
