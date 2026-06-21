import mongoose from 'mongoose';

const bookTransactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  finePaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Lost'],
    default: 'Issued'
  }
}, {
  timestamps: true
});

const BookTransaction = mongoose.model('BookTransaction', bookTransactionSchema);
export default BookTransaction;
