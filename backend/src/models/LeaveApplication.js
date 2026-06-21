import mongoose from 'mongoose';

const leaveApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Casual', 'Sick', 'Maternity', 'Paternity', 'Loss of Pay'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: String
}, {
  timestamps: true
});

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);
export default LeaveApplication;
