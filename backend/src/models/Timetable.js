import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: String, // e.g. "08:30"
    required: true
  },
  endTime: {
    type: String, // e.g. "09:20"
    required: true
  }
});

const timetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    required: true,
    default: 'A'
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  periods: [periodSchema]
}, {
  timestamps: true
});

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
