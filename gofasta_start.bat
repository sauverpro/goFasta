@echo off
title GoFasta Server + Test Buses
echo 🚀 Starting GoFasta setup...

:: 1️⃣ Start MongoDB service
echo 🔹 Starting MongoDB service...
net start MongoDB
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB service may already be running or not installed as service.
) else (
    echo MongoDB service started successfully.
)

:: 2️⃣ Start Node.js server in a new window
echo 🔹 Starting Node.js server...
start "GoFasta Server" cmd /k "cd /d %~dp0 && node server.js"

:: Wait a few seconds for server to start
timeout /t 5 /nobreak >nul

:: 3️⃣ Post 5 fake buses
echo 🔹 Posting 5 test buses...

curl -X POST "http://localhost:3000/api/gps" -H "Content-Type: application/json" -d "{\"deviceId\":\"864306200010433\",\"plateNumber\":\"RAK B88M\",\"lat\":-1.9536,\"lon\":30.0605,\"speed\":12}"
curl -X POST "http://localhost:3000/api/gps" -H "Content-Type: application/json" -d "{\"deviceId\":\"864306200010434\",\"plateNumber\":\"RAD A55C\",\"lat\":-1.9500,\"lon\":30.0800,\"speed\":10}"
curl -X POST "http://localhost:3000/api/gps" -H "Content-Type: application/json" -d "{\"deviceId\":\"864306200010435\",\"plateNumber\":\"RAK C12D\",\"lat\":-1.9550,\"lon\":30.0700,\"speed\":15}"
curl -X POST "http://localhost:3000/api/gps" -H "Content-Type: application/json" -d "{\"deviceId\":\"864306200010436\",\"plateNumber\":\"RAD D22F\",\"lat\":-1.9520,\"lon\":30.0650,\"speed\":8}"
curl -X POST "http://localhost:3000/api/gps" -H "Content-Type: application/json" -d "{\"deviceId\":\"864306200010437\",\"plateNumber\":\"RAK E33G\",\"lat\":-1.9560,\"lon\":30.0750,\"speed\":20}"

echo ✅ Test buses posted successfully!
echo 🌐 Open your browser at http://localhost:3000 to see the front-end.
pause
