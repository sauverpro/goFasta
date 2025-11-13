const Joi = require('joi');

// GPS data validation schema
const gpsDataSchema = Joi.object({
  deviceId: Joi.string().required().min(1).max(50),
  plateNumber: Joi.string().optional().min(1).max(20),
  lat: Joi.number().required().min(-90).max(90),
  lon: Joi.number().required().min(-180).max(180),
  speed: Joi.number().optional().min(0).max(200)
});

// Create device validation schema
const createDeviceSchema = Joi.object({
  deviceId: Joi.string().required().min(1).max(50),
  plateNumber: Joi.string().optional().min(1).max(20),
  lat: Joi.number().optional().min(-90).max(90),
  lon: Joi.number().optional().min(-180).max(180),
  speed: Joi.number().optional().min(0).max(200),
  destLat: Joi.number().optional().min(-90).max(90),
  destLon: Joi.number().optional().min(-180).max(180)
});

// Update device validation schema
const updateDeviceSchema = Joi.object({
  plateNumber: Joi.string().optional().min(1).max(20),
  lat: Joi.number().optional().min(-90).max(90),
  lon: Joi.number().optional().min(-180).max(180),
  speed: Joi.number().optional().min(0).max(200),
  destLat: Joi.number().optional().min(-90).max(90),
  destLon: Joi.number().optional().min(-180).max(180)
}).min(1); // At least one field must be provided

// Bulk delete validation schema
const bulkDeleteSchema = Joi.object({
  deviceIds: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(100).required()
});

// Device ID parameter validation
const deviceIdSchema = Joi.object({
  deviceId: Joi.string().required().min(1).max(50)
});

// Search query validation
const searchQuerySchema = Joi.object({
  q: Joi.string().optional().min(1).max(100),
  plateNumber: Joi.string().optional().min(1).max(20),
  minSpeed: Joi.number().optional().min(0).max(200),
  maxSpeed: Joi.number().optional().min(0).max(200),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Validation middleware functions
const validateGPSData = (req, res, next) => {
  const { error, value } = gpsDataSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
};

const validateCreateDevice = (req, res, next) => {
  const { error, value } = createDeviceSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
};

const validateUpdateDevice = (req, res, next) => {
  const { error, value } = updateDeviceSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
};

const validateBulkDelete = (req, res, next) => {
  const { error, value } = bulkDeleteSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
};

const validateDeviceId = (req, res, next) => {
  const { error, value } = deviceIdSchema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid device ID',
      details: error.details.map(d => d.message)
    });
  }
  
  req.params = value;
  next();
};

const validateSearchQuery = (req, res, next) => {
  const { error, value } = searchQuerySchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid search parameters',
      details: error.details.map(d => d.message)
    });
  }
  
  req.query = value;
  next();
};

module.exports = {
  validateGPSData,
  validateCreateDevice,
  validateUpdateDevice,
  validateBulkDelete,
  validateDeviceId,
  validateSearchQuery
};