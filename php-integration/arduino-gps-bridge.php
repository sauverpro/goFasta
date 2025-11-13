<?php
/**
 * Arduino GPS Bridge - Single File Solution
 * Receives GPS data from Arduino via GET request and forwards to GoFasta backend
 * 
 * Usage: http://your-server.com/sendData.php?deviceId=123&plateNumber=RAK123&lat=-1.944&lon=30.061&speed=25
 * Backend: https://go-fasta.onrender.com/api/gps
 */

// Configuration
define('GOFASTA_API_URL', 'https://go-fasta.onrender.com/api/gps');
define('LOG_FILE', 'gps_data.log');

// Set JSON response header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use GET request.'
    ]);
    exit();
}

/**
 * Log messages with timestamp
 */
function logMessage($message, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Validate GPS coordinates
 */
function validateCoordinates($lat, $lon) {
    if (!is_numeric($lat) || !is_numeric($lon)) {
        return "Invalid coordinate format";
    }
    
    if ($lat < -90 || $lat > 90) {
        return "Invalid latitude range (-90 to 90)";
    }
    
    if ($lon < -180 || $lon > 180) {
        return "Invalid longitude range (-180 to 180)";
    }
    
    return null;
}

/**
 * Send GPS data to GoFasta backend
 */
function sendToGoFasta($gpsData) {
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => GOFASTA_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($gpsData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: Arduino-GPS-Bridge/1.0'
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    
    if ($error) {
        return [
            'success' => false,
            'error' => "Connection error: {$error}"
        ];
    }
    
    if ($httpCode >= 200 && $httpCode < 300) {
        return [
            'success' => true,
            'data' => json_decode($response, true) ?? $response,
            'http_code' => $httpCode
        ];
    } else {
        return [
            'success' => false,
            'error' => "Backend error HTTP {$httpCode}: {$response}",
            'http_code' => $httpCode
        ];
    }
}

try {
    // Get GPS data from GET parameters
    $deviceId = $_GET['deviceId'] ?? '';
    $plateNumber = $_GET['plateNumber'] ?? '';
    $latitude = $_GET['lat'] ?? '';
    $longitude = $_GET['lon'] ?? '';
    $speed = $_GET['speed'] ?? 0;
    $timestamp = $_GET['timestamp'] ?? date('c');
    
    // Validate required parameters
    if (empty($deviceId)) {
        throw new Exception('Missing deviceId parameter');
    }
    
    if (empty($latitude) || empty($longitude)) {
        throw new Exception('Missing lat or lon parameters');
    }
    
    // Validate coordinates
    $coordError = validateCoordinates($latitude, $longitude);
    if ($coordError) {
        throw new Exception($coordError);
    }
    
    // Prepare data for GoFasta backend
    $gpsData = [
        'deviceId' => $deviceId,
        'plateNumber' => $plateNumber ?: 'UNKNOWN',
        'lat' => (float) $latitude,
        'lon' => (float) $longitude,
        'speed' => (float) $speed
    ];
    
    logMessage("Received GPS data from device {$deviceId}: {$latitude}, {$longitude}, speed: {$speed}");
    
    // Send to GoFasta backend
    $result = sendToGoFasta($gpsData);
    
    if ($result['success']) {
        logMessage("Successfully forwarded GPS data to GoFasta backend for device {$deviceId}");
        
        // Return success response to Arduino
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'GPS data received and stored successfully',
            'deviceId' => $deviceId,
            'coordinates' => [
                'lat' => $gpsData['lat'],
                'lon' => $gpsData['lon']
            ],
            'speed' => $gpsData['speed'],
            'timestamp' => date('c'),
            'backend_response' => $result['data'] ?? null
        ]);
    } else {
        throw new Exception('Failed to store data: ' . $result['error']);
    }
    
} catch (Exception $e) {
    logMessage("Error processing GPS data: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}

/*
ARDUINO EXAMPLE CODE:
=====================

#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "http://your-server.com/sendData.php";

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected!");
}

void loop() {
    // Your GPS reading code here
    String deviceId = "864306200010433";
    String plateNumber = "RAK B88M";
    float lat = -1.9441;
    float lon = 30.0619;
    int speed = 25;
    
    sendGPSData(deviceId, plateNumber, lat, lon, speed);
    delay(30000); // Send every 30 seconds
}

void sendGPSData(String deviceId, String plateNumber, float lat, float lon, int speed) {
    HTTPClient http;
    String url = String(serverURL) + 
                "?deviceId=" + deviceId +
                "&plateNumber=" + plateNumber +
                "&lat=" + String(lat, 6) +
                "&lon=" + String(lon, 6) +
                "&speed=" + String(speed);
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode > 0) {
        String response = http.getString();
        Serial.println("Response: " + response);
    } else {
        Serial.println("HTTP Error: " + String(httpCode));
    }
    http.end();
}

USAGE EXAMPLES:
==============

1. Basic GPS data:
http://your-server.com/sendData.php?deviceId=123&lat=-1.944&lon=30.061&speed=25

2. With plate number:
http://your-server.com/sendData.php?deviceId=123&plateNumber=RAK123&lat=-1.944&lon=30.061&speed=25

3. With timestamp:
http://your-server.com/sendData.php?deviceId=123&lat=-1.944&lon=30.061&speed=25&timestamp=2025-11-14T12:30:45Z

REQUIRED PARAMETERS:
===================
- deviceId: Unique device identifier
- lat: Latitude (-90 to 90)
- lon: Longitude (-180 to 180)

OPTIONAL PARAMETERS:
===================
- plateNumber: Vehicle plate number (default: "UNKNOWN")
- speed: Speed in km/h (default: 0)
- timestamp: ISO 8601 timestamp (default: current time)

*/
?>