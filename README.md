# GoFasta Server

A Node.js/Express backend server for the GoFasta GPS tracking application using MongoDB.

## Features

- **Full CRUD Operations** for device management
- **GPS tracking** data management with real-time updates
- **Search and filtering** capabilities for devices
- **Pagination** support for large datasets
- **Real-time device position simulation** via background services
- **RESTful API** with comprehensive endpoints
- **PHP Integration** for data retrieval and forwarding to external URLs
- **Web dashboard** interface for monitoring
- **Input validation** and security middleware
- **Comprehensive logging** and error handling
- **Rate limiting** and security headers

## Project Structure

```
gofasta-server/
├── config/
│   ├── database.js     # Database connection configuration
│   └── logger.js       # Winston logging configuration
├── controllers/
│   └── deviceController.js  # Device-related request handlers
├── middleware/
│   ├── errorHandler.js     # Global error handling middleware
│   └── validation.js       # Input validation middleware
├── models/
│   └── Device.js           # MongoDB Device schema
├── public/
│   └── index.html          # Frontend dashboard
├── routes/
│   └── deviceRoutes.js     # Device API routes
├── services/
│   └── deviceService.js    # Background services
├── utils/
│   └── haversine.js        # Distance calculation utility
├── php-integration/          # PHP integration for data retrieval and forwarding
│   ├── gofasta-data-sender.php    # Main PHP class for data operations
│   ├── config.php                 # PHP configuration file
│   ├── example-basic.php          # Basic usage examples
│   ├── scheduled-sync.php         # Automated sync script
│   ├── curl-to-php-example.php    # cURL to PHP conversion example
│   ├── webhook-receiver.php       # Sample webhook receiver
│   └── README.md                  # PHP integration documentation
├── logs/                   # Application logs (auto-created)
├── .env                    # Environment variables
├── server.js               # Main application entry point
└── package.json            # Dependencies and scripts
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gofasta-server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string and other configurations.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `CORS_ORIGIN`: Allowed CORS origins
- `POSITION_UPDATE_INTERVAL`: Position update interval in milliseconds
- `LOG_LEVEL`: Logging level (info, debug, error)

## API Endpoints

### Device Management (Full CRUD)

#### CREATE Device
- **POST** `/api/devices` - Create a new device

#### READ Operations  
- **GET** `/api/devices` - Get all devices (with pagination)
- **GET** `/api/devices/:deviceId` - Get specific device
- **GET** `/api/devices/search` - Search devices with filters

#### UPDATE Device
- **PUT** `/api/devices/:deviceId` - Update device information

#### DELETE Operations
- **DELETE** `/api/devices/:deviceId` - Delete specific device
- **DELETE** `/api/devices` - Bulk delete multiple devices

### Legacy GPS Endpoint
- **POST** `/api/gps` - Update GPS data (backward compatibility)

### System Endpoints
- **GET** `/health` - Health check

For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### PHP Integration
- **GET** device data and forward to hosted URLs
- **Automated synchronization** with cron jobs
- **Error handling** and retry logic
- **Configurable** endpoints and authentication

See [php-integration/README.md](./php-integration/README.md) for PHP integration documentation.

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (placeholder)

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:3000` to view the dashboard.

3. Use the batch file for quick setup:
```bash
gofasta_start.bat
```

## Background Services

The server includes a background service that automatically updates device positions every minute to simulate real-time GPS tracking.

## Security Features

- Helmet.js for security headers
- Rate limiting
- Input validation
- CORS configuration
- Error handling middleware

## Logging

The application uses Winston for structured logging:
- Console logging for development
- File logging for production
- Different log levels (info, error, debug)

## Database Schema

### Device Model
```javascript
{
  device_id: String (required, unique),
  plate_number: String,
  last_lat: Number,
  last_lon: Number,
  last_speed: Number,
  last_update: Date,
  dest_lat: Number,
  dest_lon: Number
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC