import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNo: {
    type: String,
    required: true
  },
  bedCount: {
    type: Number,
    required: true,
    default: 4
  },
  occupiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g. 'Stark Block A'
  },
  type: {
    type: String,
    enum: ['Boys', 'Girls'],
    required: true
  },
  rooms: [roomSchema]
}, {
  timestamps: true
});

const Hostel = mongoose.model('Hostel', hostelSchema);
export default Hostel;
