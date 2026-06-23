import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Teachers', 'Students', 'Parents'],
    default: 'All'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

noticeSchema.index({ targetUser: 1 });
noticeSchema.index({ createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
