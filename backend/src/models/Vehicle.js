import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true // e.g. "GJ-01-XX-0000"
  },
  model: {
    type: String,
    required: true,
    trim: true // e.g. "School Bus - Tata Starbus"
  },
  capacity: {
    type: Number,
    required: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverPhone: {
    type: String,
    required: true,
    trim: true
  },
  driverLicense: {
    type: String,
    required: true,
    trim: true
  },
  routeDetails: {
    routeName: { type: String, required: true },
    pickupPoints: [String],
    startLocation: String,
    endLocation: String
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
