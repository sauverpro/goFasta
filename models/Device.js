const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true, unique: true },
  plate_number: String,
  last_lat: Number,
  last_lon: Number,
  last_speed: Number,
  last_update: Date,
  dest_lat: Number,
  dest_lon: Number
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
