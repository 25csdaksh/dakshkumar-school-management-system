import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partially Paid'],
    default: 'Unpaid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'None'],
    default: 'None'
  }
}, {
  timestamps: true
});

feeSchema.index({ student: 1 });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
