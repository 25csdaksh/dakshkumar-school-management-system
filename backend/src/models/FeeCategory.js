import mongoose from 'mongoose';

const feeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true // e.g. "Tuition Fee", "Transport Fee", "Hostel Fee", "Exam Fee"
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const FeeCategory = mongoose.model('FeeCategory', feeCategorySchema);
export default FeeCategory;
