import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
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
  parentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  parentName: {
    type: String,
    trim: true
  },
  parentPhone: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  aadhaarNumber: {
    type: String,
    trim: true
  },
  previousSchoolDetails: {
    type: String,
    trim: true
  },
  medicalHistory: [String],
  vaccinationRecords: [String],
  healthCheckups: [{
    date: { type: Date, default: Date.now },
    height: Number, // in cm
    weight: Number, // in kg
    bloodPressure: String,
    remarks: String
  }],
  assignedRoute: String,
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  assignedHostelRoom: String,
  documents: [{
    docType: String, // e.g. "Aadhaar", "Birth Certificate", "Leaving Certificate"
    fileUrl: String
  }]
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
