import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true,
    trim: true // e.g., "2026-2027"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;
