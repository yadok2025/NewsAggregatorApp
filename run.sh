#!/bin/bash
# NewsAggregator App — Lanza backend + frontend

APP_DIR="$HOME/Projects/NewsAggregatorApp"

# Arrancar backend en background con nohup para que sobreviva al cierre
cd "$APP_DIR/server"
nohup node server.js > /tmp/newsaggregator-backend.log 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID

# esperar a que el backend responda
for i in $(seq 1 10); do
    if curl -s http://localhost:3001/api/stats > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Arrancar frontend en background (modo dev con Vite) con nohup
cd "$APP_DIR/client"
nohup npm run dev > /tmp/newsaggregator-frontend.log 2>&1 &
FRONTEND_PID=$!
disown $FRONTEND_PID

# esperar a que el frontend responda
for i in $(seq 1 10); do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Abrir navegador
xdg-open http://localhost:5173 2>/dev/null || sensible-browser http://localhost:5173 2>/dev/null || firefox http://localhost:5173 2>/dev/null

echo "NewsAggregator App corriendo:"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "PIDs: backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Logs: /tmp/newsaggregator-backend.log /tmp/newsaggregator-frontend.log"
