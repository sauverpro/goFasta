# GoFasta Server API Documentation

Complete CRUD API for device management in the GoFasta GPS tracking system.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently no authentication is required. All endpoints are publicly accessible.

---

## Device CRUD Operations

### 1. CREATE Device
Create a new device in the system.

**Endpoint:** `POST /api/devices`

**Request Body:**
```json
{
  "deviceId": "864306200010433",
  "plateNumber": "RAK B88M",
  "lat": -1.9536,
  "lon": 30.0605,
  "speed": 12,
  "destLat": -1.9500,
  "destLon": 30.0800
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Device created successfully",
  "data": {
    "device_id": "864306200010433",
    "plate_number": "RAK B88M",
    "last_lat": -1.9536,
    "last_lon": 30.0605,
    "last_speed": 12,
    "dest_lat": -1.9500,
    "dest_lon": 30.0800,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. READ All Devices (with pagination)
Retrieve all devices with optional pagination and sorting.

**Endpoint:** `GET /api/devices`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (default: 'last_update')
- `order` (optional): Sort order 'asc'/'desc' (default: 'desc')

**Example:** `GET /api/devices?page=1&limit=5&sort=plate_number&order=asc`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "total": 15,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "device_id": "864306200010433",
      "plate_number": "RAK B88M",
      "last_lat": -1.9536,
      "last_lon": 30.0605,
      "last_speed": 12,
      "last_update": "2024-01-01T12:00:00.000Z",
      "etaSeconds": 300
    }
  ]
}
```

### 3. READ Single Device
Get details of a specific device by ID.

**Endpoint:** `GET /api/devices/:deviceId`

**Example:** `GET /api/devices/864306200010433`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "device_id": "864306200010433",
    "plate_number": "RAK B88M",
    "last_lat": -1.9536,
    "last_lon": 30.0605,
    "last_speed": 12,
    "last_update": "2024-01-01T12:00:00.000Z",
    "dest_lat": -1.9500,
    "dest_lon": 30.0800,
    "etaSeconds": 300,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Device not found"
}
```

### 4. UPDATE Device
Update an existing device's information.

**Endpoint:** `PUT /api/devices/:deviceId`

**Request Body (all fields optional):**
```json
{
  "plateNumber": "RAK B89M",
  "lat": -1.9540,
  "lon": 30.0610,
  "speed": 15,
  "destLat": -1.9510,
  "destLon": 30.0820
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "device_id": "864306200010433",
    "plate_number": "RAK B89M",
    "last_lat": -1.9540,
    "last_lon": 30.0610,
    "last_speed": 15,
    "dest_lat": -1.9510,
    "dest_lon": 30.0820,
    "last_update": "2024-01-01T12:05:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z"
  }
}
```

### 5. DELETE Single Device
Delete a specific device by ID.

**Endpoint:** `DELETE /api/devices/:deviceId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device deleted successfully",
  "data": {
    "device_id": "864306200010433",
    "plate_number": "RAK B88M"
  }
}
```

### 6. DELETE Multiple Devices (Bulk Delete)
Delete multiple devices at once.

**Endpoint:** `DELETE /api/devices`

**Request Body:**
```json
{
  "deviceIds": ["864306200010433", "864306200010434", "864306200010435"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 devices deleted successfully",
  "data": {
    "requestedCount": 3,
    "deletedCount": 3,
    "deviceIds": ["864306200010433", "864306200010434", "864306200010435"]
  }
}
```

### 7. SEARCH Devices
Search devices with various filters.

**Endpoint:** `GET /api/devices/search`

**Query Parameters:**
- `q` (optional): General search term (searches device_id and plate_number)
- `plateNumber` (optional): Filter by plate number
- `minSpeed` (optional): Minimum speed filter
- `maxSpeed` (optional): Maximum speed filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `GET /api/devices/search?q=RAK&minSpeed=10&maxSpeed=50&page=1&limit=5`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "page": 1,
  "pages": 1,
  "query": {
    "q": "RAK",
    "minSpeed": "10",
    "maxSpeed": "50",
    "page": "1",
    "limit": "5"
  },
  "data": [
    {
      "device_id": "864306200010433",
      "plate_number": "RAK B88M",
      "last_lat": -1.9536,
      "last_lon": 30.0605,
      "last_speed": 12,
      "last_update": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Legacy GPS Endpoint

### Update GPS Data (Legacy)
This endpoint maintains backward compatibility for GPS data updates.

**Endpoint:** `POST /api/gps`

**Request Body:**
```json
{
  "deviceId": "864306200010433",
  "plateNumber": "RAK B88M",
  "lat": -1.9536,
  "lon": 30.0605,
  "speed": 12
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "GPS data updated successfully",
  "device": {
    "device_id": "864306200010433",
    "plate_number": "RAK B88M",
    "last_update": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Health Check

### Server Health
Check if the server is running and responsive.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 1234.567
}
```

---

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    "\"deviceId\" is required",
    "\"lat\" must be a number between -90 and 90"
  ]
}
```

### Not Found (404 Not Found)
```json
{
  "success": false,
  "error": "Device not found"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

---

## Field Validations

### Device ID
- **Type:** String
- **Required:** Yes (for creation)
- **Min Length:** 1
- **Max Length:** 50
- **Must be unique**

### Plate Number
- **Type:** String
- **Required:** No
- **Min Length:** 1
- **Max Length:** 20

### Coordinates (lat/lon)
- **Type:** Number
- **Latitude range:** -90 to 90
- **Longitude range:** -180 to 180

### Speed
- **Type:** Number
- **Range:** 0 to 200 (km/h)
- **Required:** No

### Destination Coordinates (destLat/destLon)
- **Type:** Number
- **Same range as regular coordinates**
- **Required:** No

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Applies to:** All `/api/*` endpoints

---

## CORS

- **Enabled:** Yes
- **Origins:** Configurable via environment (default: all origins)

---

## Examples with cURL

### Create a new device:
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "TEST001",
    "plateNumber": "RAK T01",
    "lat": -1.9536,
    "lon": 30.0605,
    "speed": 25
  }'
```

### Get all devices:
```bash
curl http://localhost:3000/api/devices
```

### Get specific device:
```bash
curl http://localhost:3000/api/devices/TEST001
```

### Update device:
```bash
curl -X PUT http://localhost:3000/api/devices/TEST001 \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "RAK T02",
    "speed": 30
  }'
```

### Delete device:
```bash
curl -X DELETE http://localhost:3000/api/devices/TEST001
```

### Search devices:
```bash
curl "http://localhost:3000/api/devices/search?q=RAK&minSpeed=20"
```