const Device = require('../models/Device');
const haversineDistance = require('../utils/haversine');
const logger = require('../config/logger');

// POST /api/devices - Create new device
exports.createDevice = async (req, res, next) => {
  try {
    const { deviceId, plateNumber, lat, lon, speed, destLat, destLon } = req.body;

    // Check if device already exists
    const existingDevice = await Device.findOne({ device_id: deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        error: 'Device with this ID already exists'
      });
    }

    const deviceData = {
      device_id: deviceId,
      last_update: new Date()
    };

    // Add optional fields if provided
    if (plateNumber !== undefined) deviceData.plate_number = plateNumber;
    if (lat !== undefined) deviceData.last_lat = lat;
    if (lon !== undefined) deviceData.last_lon = lon;
    if (speed !== undefined) deviceData.last_speed = speed;
    if (destLat !== undefined) deviceData.dest_lat = destLat;
    if (destLon !== undefined) deviceData.dest_lon = destLon;

    const device = new Device(deviceData);
    await device.save();

    logger.info(`New device created: ${deviceId}`, {
      deviceId,
      plateNumber,
      coordinates: lat && lon ? { lat, lon } : null
    });

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: {
        device_id: device.device_id,
        plate_number: device.plate_number,
        last_lat: device.last_lat,
        last_lon: device.last_lon,
        last_speed: device.last_speed,
        dest_lat: device.dest_lat,
        dest_lon: device.dest_lon,
        created_at: device.createdAt,
        updated_at: device.updatedAt
      }
    });
  } catch (err) {
    logger.error('Error in createDevice:', err);
    next(err);
  }
};

// POST /api/gps
exports.upsertGPSData = async (req, res, next) => {
  try {
    const { deviceId, plateNumber, lat, lon, speed } = req.body;

    const updateData = {
      last_lat: lat,
      last_lon: lon,
      last_update: new Date()
    };

    // Only update fields that are provided
    if (plateNumber !== undefined) updateData.plate_number = plateNumber;
    if (speed !== undefined) updateData.last_speed = speed;

    const device = await Device.findOneAndUpdate(
      { device_id: deviceId },
      updateData,
      { new: true, upsert: true }
    );

    logger.info(`GPS data updated for device: ${deviceId}`, {
      deviceId,
      plateNumber,
      coordinates: { lat, lon },
      speed
    });

    res.json({ 
      success: true, 
      message: 'GPS data updated successfully',
      device: {
        device_id: device.device_id,
        plate_number: device.plate_number,
        last_update: device.last_update
      }
    });
  } catch (err) {
    logger.error('Error in upsertGPSData:', err);
    next(err);
  }
};

// GET /api/devices
exports.getDevices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'last_update', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const devices = await Device.find()
      .sort(sortObj)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Device.countDocuments();

    const formattedDevices = devices.map(device => {
      let etaSeconds = null;

      // Calculate ETA if we have valid location and speed data
      if (device.last_lat && device.last_lon && device.last_speed && device.last_speed > 0) {
        // Generate a random destination nearby for demo purposes
        // -1.9683524,30.0890925

        const destLat = -1.9683524;
        const destLon = 30.0890925;

        const distance = haversineDistance(device.last_lat, device.last_lon, destLat, destLon);
        const speedMs = device.last_speed / 3.6; // Convert km/h to m/s
        etaSeconds = speedMs > 0 ? Math.round(distance / speedMs) : null;
      }

      return {
        device_id: device.device_id,
        plate_number: device.plate_number,
        last_lat: device.last_lat,
        last_lon: device.last_lon,
        last_speed: device.last_speed,
        last_update: device.last_update,
        etaSeconds
      };
    });

    logger.info(`Retrieved ${formattedDevices.length} devices (page ${page} of ${Math.ceil(total / limit)})`);

    res.json({ 
      success: true, 
      count: formattedDevices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: formattedDevices 
    });
  } catch (err) {
    logger.error('Error in getDevices:', err);
    next(err);
  }
};

// GET /api/devices/:deviceId - Get single device
exports.getDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOne({ device_id: deviceId });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    let etaSeconds = null;
    if (device.last_lat && device.last_lon && device.last_speed && device.last_speed > 0) {
      const destLat = device.last_lat + (Math.random() - 0.5) * 0.01;
      const destLon = device.last_lon + (Math.random() - 0.5) * 0.01;
      const distance = haversineDistance(device.last_lat, device.last_lon, destLat, destLon);
      const speedMs = device.last_speed / 3.6;
      etaSeconds = speedMs > 0 ? Math.round(distance / speedMs) : null;
    }

    const formattedDevice = {
      device_id: device.device_id,
      plate_number: device.plate_number,
      last_lat: device.last_lat,
      last_lon: device.last_lon,
      last_speed: device.last_speed,
      last_update: device.last_update,
      dest_lat: device.dest_lat,
      dest_lon: device.dest_lon,
      etaSeconds,
      created_at: device.createdAt,
      updated_at: device.updatedAt
    };

    logger.info(`Retrieved device: ${deviceId}`);

    res.json({
      success: true,
      data: formattedDevice
    });
  } catch (err) {
    logger.error('Error in getDevice:', err);
    next(err);
  }
};

// Disabled: Random bus positioning (using only real GPS data from Arduino)
exports.randomizeBusPositions = async () => {
  try {
    const deviceCount = await Device.countDocuments({
      last_lat: { $exists: true, $ne: null },
      last_lon: { $exists: true, $ne: null }
    });

    if (deviceCount === 0) {
      logger.info('🔄 No devices with coordinates found');
      console.log('🔄 No devices with coordinates found');
    } else {
      logger.info(`🔄 ${deviceCount} devices using real GPS coordinates (random positioning disabled)`);
      console.log(`🔄 ${deviceCount} devices using real GPS coordinates (random positioning disabled)`);
    }
  } catch (err) {
    logger.error('Error checking device positions:', err);
    console.error('Error checking device positions:', err);
  }
};

// PUT /api/devices/:deviceId - Update device
exports.updateDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { plateNumber, lat, lon, speed, destLat, destLon } = req.body;

    const device = await Device.findOne({ device_id: deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    const updateData = {
      last_update: new Date()
    };

    // Update only provided fields
    if (plateNumber !== undefined) updateData.plate_number = plateNumber;
    if (lat !== undefined) updateData.last_lat = lat;
    if (lon !== undefined) updateData.last_lon = lon;
    if (speed !== undefined) updateData.last_speed = speed;
    if (destLat !== undefined) updateData.dest_lat = destLat;
    if (destLon !== undefined) updateData.dest_lon = destLon;

    const updatedDevice = await Device.findOneAndUpdate(
      { device_id: deviceId },
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Device updated: ${deviceId}`, {
      deviceId,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Device updated successfully',
      data: {
        device_id: updatedDevice.device_id,
        plate_number: updatedDevice.plate_number,
        last_lat: updatedDevice.last_lat,
        last_lon: updatedDevice.last_lon,
        last_speed: updatedDevice.last_speed,
        dest_lat: updatedDevice.dest_lat,
        dest_lon: updatedDevice.dest_lon,
        last_update: updatedDevice.last_update,
        updated_at: updatedDevice.updatedAt
      }
    });
  } catch (err) {
    logger.error('Error in updateDevice:', err);
    next(err);
  }
};

// DELETE /api/devices/:deviceId - Delete device
exports.deleteDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOneAndDelete({ device_id: deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    logger.info(`Device deleted: ${deviceId}`, {
      deviceId,
      plateNumber: device.plate_number
    });

    res.json({
      success: true,
      message: 'Device deleted successfully',
      data: {
        device_id: device.device_id,
        plate_number: device.plate_number
      }
    });
  } catch (err) {
    logger.error('Error in deleteDevice:', err);
    next(err);
  }
};

// DELETE /api/devices - Bulk delete devices
exports.bulkDeleteDevices = async (req, res, next) => {
  try {
    const { deviceIds } = req.body;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'deviceIds must be a non-empty array'
      });
    }

    const result = await Device.deleteMany({ device_id: { $in: deviceIds } });

    logger.info(`Bulk delete completed: ${result.deletedCount} devices deleted`, {
      requestedIds: deviceIds,
      deletedCount: result.deletedCount
    });

    res.json({
      success: true,
      message: `${result.deletedCount} devices deleted successfully`,
      data: {
        requestedCount: deviceIds.length,
        deletedCount: result.deletedCount,
        deviceIds: deviceIds
      }
    });
  } catch (err) {
    logger.error('Error in bulkDeleteDevices:', err);
    next(err);
  }
};

// GET /api/devices/search - Search devices
exports.searchDevices = async (req, res, next) => {
  try {
    const { q, plateNumber, minSpeed, maxSpeed, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Text search on device_id and plate_number
    if (q) {
      query.$or = [
        { device_id: { $regex: q, $options: 'i' } },
        { plate_number: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by plate number
    if (plateNumber) {
      query.plate_number = { $regex: plateNumber, $options: 'i' };
    }

    // Filter by speed range
    if (minSpeed || maxSpeed) {
      query.last_speed = {};
      if (minSpeed) query.last_speed.$gte = parseFloat(minSpeed);
      if (maxSpeed) query.last_speed.$lte = parseFloat(maxSpeed);
    }

    const devices = await Device.find(query)
      .sort({ last_update: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Device.countDocuments(query);

    const formattedDevices = devices.map(device => ({
      device_id: device.device_id,
      plate_number: device.plate_number,
      last_lat: device.last_lat,
      last_lon: device.last_lon,
      last_speed: device.last_speed,
      last_update: device.last_update
    }));

    logger.info(`Search completed: ${formattedDevices.length} devices found`, {
      query: req.query,
      resultCount: formattedDevices.length
    });

    res.json({
      success: true,
      count: formattedDevices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      query: req.query,
      data: formattedDevices
    });
  } catch (err) {
    logger.error('Error in searchDevices:', err);
    next(err);
  }
};
