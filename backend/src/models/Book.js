import mongoose from 'mongoose';

const bookIssueSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  }
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1
  },
  issues: [bookIssueSchema]
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
