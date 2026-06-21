import mongoose from 'mongoose';

const subjectBindingSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sections: {
    type: [String],
    default: ['A']
  },
  subjects: [subjectBindingSchema],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sectionTeachers: [{
    section: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }]
}, {
  timestamps: true
});

const Class = mongoose.model('Class', classSchema);
export default Class;
