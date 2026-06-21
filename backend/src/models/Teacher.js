import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  salary: {
    type: Number,
    default: 0
  },
  designation: {
    type: String,
    trim: true,
    default: 'Assistant Teacher'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  salaryDetails: {
    basic: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

teacherSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('user')) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user);
      if (user) {
        this.name = user.name;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
