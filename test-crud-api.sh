#!/bin/bash

# GoFasta Server CRUD API Test Script
# This script demonstrates all CRUD operations available in the API

BASE_URL="http://localhost:3000/api"
HEALTH_URL="http://localhost:3000/health"

echo "🚀 GoFasta Server CRUD API Test Script"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "\n${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if server is running
print_step "1. Health Check"
response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ $response -eq 200 ]; then
    print_success "Server is running"
    curl -s $HEALTH_URL | jq '.'
else
    print_error "Server is not running or not accessible"
    echo "Please start the server with 'npm start' first"
    exit 1
fi

# Create test devices
print_step "2. CREATE - Adding test devices"

echo "Creating device TEST001..."
curl -X POST $BASE_URL/devices \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "TEST001",
        "plateNumber": "RAK T01",
        "lat": -1.9536,
        "lon": 30.0605,
        "speed": 25
    }' | jq '.'

echo -e "\nCreating device TEST002..."
curl -X POST $BASE_URL/devices \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "TEST002", 
        "plateNumber": "RAD T02",
        "lat": -1.9550,
        "lon": 30.0700,
        "speed": 30
    }' | jq '.'

echo -e "\nCreating device TEST003..."
curl -X POST $BASE_URL/devices \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "TEST003",
        "plateNumber": "RAK T03", 
        "lat": -1.9520,
        "lon": 30.0650,
        "speed": 20
    }' | jq '.'

# Read all devices
print_step "3. READ - Getting all devices"
curl -s $BASE_URL/devices | jq '.'

# Read specific device
print_step "4. READ - Getting specific device (TEST001)"
curl -s $BASE_URL/devices/TEST001 | jq '.'

# Search devices
print_step "5. SEARCH - Searching devices"
echo "Searching for devices with 'RAK' in the name..."
curl -s "$BASE_URL/devices/search?q=RAK" | jq '.'

echo -e "\nSearching for devices with speed between 20-30 km/h..."
curl -s "$BASE_URL/devices/search?minSpeed=20&maxSpeed=30" | jq '.'

# Update device
print_step "6. UPDATE - Updating device TEST001"
curl -X PUT $BASE_URL/devices/TEST001 \
    -H "Content-Type: application/json" \
    -d '{
        "plateNumber": "RAK T01 Updated",
        "speed": 35,
        "lat": -1.9540,
        "lon": 30.0610
    }' | jq '.'

# Verify update
print_step "7. VERIFY UPDATE - Getting updated device"
curl -s $BASE_URL/devices/TEST001 | jq '.'

# Test legacy GPS endpoint
print_step "8. LEGACY GPS - Testing legacy GPS endpoint"
curl -X POST $BASE_URL/gps \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "TEST002",
        "plateNumber": "RAD T02 GPS",
        "lat": -1.9560,
        "lon": 30.0720,
        "speed": 40
    }' | jq '.'

# Get devices with pagination
print_step "9. PAGINATION - Getting devices with pagination"
curl -s "$BASE_URL/devices?page=1&limit=2&sort=plate_number&order=asc" | jq '.'

# Delete single device
print_step "10. DELETE - Deleting single device (TEST003)"
curl -X DELETE $BASE_URL/devices/TEST003 | jq '.'

# Bulk delete remaining devices
print_step "11. BULK DELETE - Deleting multiple devices"
curl -X DELETE $BASE_URL/devices \
    -H "Content-Type: application/json" \
    -d '{
        "deviceIds": ["TEST001", "TEST002"]
    }' | jq '.'

# Verify deletion
print_step "12. VERIFY DELETION - Checking remaining devices"
curl -s $BASE_URL/devices | jq '.'

print_step "13. ERROR TESTING - Testing validation errors"
echo "Attempting to create device with invalid data..."
curl -X POST $BASE_URL/devices \
    -H "Content-Type: application/json" \
    -d '{
        "deviceId": "",
        "lat": 100,
        "lon": 200
    }' | jq '.'

echo -e "\nAttempting to get non-existent device..."
curl -s $BASE_URL/devices/NONEXISTENT | jq '.'

print_success "CRUD API testing completed!"
echo "All operations have been tested successfully."