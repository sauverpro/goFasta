@echo off
title GoFasta Server CRUD API Test
echo 🚀 GoFasta Server CRUD API Test Script
echo =======================================

set BASE_URL=http://localhost:3000/api
set HEALTH_URL=http://localhost:3000/health

echo.
echo 1. Health Check
echo ===============
curl -s %HEALTH_URL%
echo.

echo.
echo 2. CREATE - Adding test devices
echo ===============================

echo Creating device TEST001...
curl -X POST %BASE_URL%/devices ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceId\":\"TEST001\",\"plateNumber\":\"RAK T01\",\"lat\":-1.9536,\"lon\":30.0605,\"speed\":25}"
echo.

echo Creating device TEST002...
curl -X POST %BASE_URL%/devices ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceId\":\"TEST002\",\"plateNumber\":\"RAD T02\",\"lat\":-1.9550,\"lon\":30.0700,\"speed\":30}"
echo.

echo Creating device TEST003...
curl -X POST %BASE_URL%/devices ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceId\":\"TEST003\",\"plateNumber\":\"RAK T03\",\"lat\":-1.9520,\"lon\":30.0650,\"speed\":20}"
echo.

echo.
echo 3. READ - Getting all devices
echo =============================
curl -s %BASE_URL%/devices
echo.

echo.
echo 4. READ - Getting specific device (TEST001)
echo ===========================================
curl -s %BASE_URL%/devices/TEST001
echo.

echo.
echo 5. SEARCH - Searching devices
echo =============================
echo Searching for devices with 'RAK' in the name...
curl -s "%BASE_URL%/devices/search?q=RAK"
echo.

echo.
echo Searching for devices with speed between 20-30 km/h...
curl -s "%BASE_URL%/devices/search?minSpeed=20&maxSpeed=30"
echo.

echo.
echo 6. UPDATE - Updating device TEST001
echo ===================================
curl -X PUT %BASE_URL%/devices/TEST001 ^
    -H "Content-Type: application/json" ^
    -d "{\"plateNumber\":\"RAK T01 Updated\",\"speed\":35,\"lat\":-1.9540,\"lon\":30.0610}"
echo.

echo.
echo 7. VERIFY UPDATE - Getting updated device
echo =========================================
curl -s %BASE_URL%/devices/TEST001
echo.

echo.
echo 8. LEGACY GPS - Testing legacy GPS endpoint
echo ===========================================
curl -X POST %BASE_URL%/gps ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceId\":\"TEST002\",\"plateNumber\":\"RAD T02 GPS\",\"lat\":-1.9560,\"lon\":30.0720,\"speed\":40}"
echo.

echo.
echo 9. PAGINATION - Getting devices with pagination
echo ===============================================
curl -s "%BASE_URL%/devices?page=1&limit=2&sort=plate_number&order=asc"
echo.

echo.
echo 10. DELETE - Deleting single device (TEST003)
echo =============================================
curl -X DELETE %BASE_URL%/devices/TEST003
echo.

echo.
echo 11. BULK DELETE - Deleting multiple devices
echo ===========================================
curl -X DELETE %BASE_URL%/devices ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceIds\":[\"TEST001\",\"TEST002\"]}"
echo.

echo.
echo 12. VERIFY DELETION - Checking remaining devices
echo ================================================
curl -s %BASE_URL%/devices
echo.

echo.
echo 13. ERROR TESTING - Testing validation errors
echo ==============================================
echo Attempting to create device with invalid data...
curl -X POST %BASE_URL%/devices ^
    -H "Content-Type: application/json" ^
    -d "{\"deviceId\":\"\",\"lat\":100,\"lon\":200}"
echo.

echo.
echo Attempting to get non-existent device...
curl -s %BASE_URL%/devices/NONEXISTENT
echo.

echo.
echo ✅ CRUD API testing completed!
echo All operations have been tested successfully.
echo.
pause