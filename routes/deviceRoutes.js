const express = require('express');
const router = express.Router();
const {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  bulkDeleteDevices,
  searchDevices,
  upsertGPSData
} = require('../controllers/deviceController');

const { 
  validateGPSData,
  validateCreateDevice,
  validateUpdateDevice,
  validateBulkDelete,
  validateDeviceId,
  validateSearchQuery
} = require('../middleware/validation');

// Device CRUD routes
router.post('/devices', validateCreateDevice, createDevice);           // CREATE
router.get('/devices/search', validateSearchQuery, searchDevices);     // SEARCH
router.get('/devices', getDevices);                                    // READ ALL
router.get('/devices/:deviceId', validateDeviceId, getDevice);         // READ ONE
router.put('/devices/:deviceId', validateDeviceId, validateUpdateDevice, updateDevice); // UPDATE
router.delete('/devices/:deviceId', validateDeviceId, deleteDevice);   // DELETE ONE
router.delete('/devices', validateBulkDelete, bulkDeleteDevices);      // DELETE BULK

// GPS tracking route (legacy - maps to upsert operation)
router.post('/gps', validateGPSData, upsertGPSData);

module.exports = router;
