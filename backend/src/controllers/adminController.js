import User from '../models/User.js';
import Class from '../models/Class.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';

// @desc    Admin: Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const classCount = await Class.countDocuments();
    const noticeCount = await Notice.countDocuments();

    // Fee calculations
    const fees = await Fee.find({});
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach(fee => {
      totalInvoiced += fee.amount;
      totalCollected += fee.amountPaid || 0;
      if (fee.status === 'Unpaid') {
        totalPending += fee.amount;
      } else if (fee.status === 'Partially Paid') {
        totalPending += (fee.amount - fee.amountPaid);
      }
    });

    res.json({
      studentCount,
      teacherCount,
      classCount,
      noticeCount,
      financials: {
        totalInvoiced,
        totalCollected,
        totalPending
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Setup class
export const createClass = async (req, res) => {
  const { name, sections, classTeacher } = req.body;
  try {
    const classExists = await Class.findOne({ name });
    if (classExists) {
      return res.status(400).json({ message: 'Class already exists' });
    }

    const newClass = new Class({
      name,
      sections: sections || ['A'],
      classTeacher: classTeacher || undefined
    });

    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: List classes
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate('classTeacher', 'name email')
      .populate('subjects.subject')
      .populate('subjects.teacher', 'name email');

    // Format output to look like flat objects for frontend compatibility
    const formatted = classes.map(c => ({
      _id: c._id,
      name: c.name,
      sections: c.sections,
      classTeacher: c.classTeacher,
      subjects: c.subjects.map(s => ({
        name: s.subject?.name || 'Subject',
        teacher: s.teacher
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Assign subjects & teachers
export const addSubjectToClass = async (req, res) => {
  const { subjectName, teacherId } = req.body;
  try {
    const schoolClass = await Class.findById(req.params.id);
    if (!schoolClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Find or create subject reference
    let subDoc = await Subject.findOne({ name: subjectName });
    if (!subDoc) {
      const code = subjectName.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
      subDoc = new Subject({ name: subjectName, code });
      await subDoc.save();
    }

    schoolClass.subjects.push({
      subject: subDoc._id,
      teacher: teacherId || null
    });

    await schoolClass.save();

    // Reload with populates
    const updatedClass = await Class.findById(req.params.id)
      .populate('subjects.subject')
      .populate('subjects.teacher', 'name email');

    const formatted = {
      _id: updatedClass._id,
      name: updatedClass.name,
      sections: updatedClass.sections,
      classTeacher: updatedClass.classTeacher,
      subjects: updatedClass.subjects.map(s => ({
        name: s.subject?.name || 'Subject',
        teacher: s.teacher
      }))
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Publish notice
export const createNotice = async (req, res) => {
  const { title, content, targetAudience } = req.body;

  try {
    const newNotice = new Notice({
      title,
      content,
      targetAudience,
      createdBy: req.user._id
    });

    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notice announcements
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({}).populate('createdBy', 'name role');
    
    // role is populated, map role.name for display compatibility
    const formatted = notices.map(n => ({
      _id: n._id,
      title: n.title,
      content: n.content,
      targetAudience: n.targetAudience,
      createdAt: n.createdAt,
      createdBy: {
        name: n.createdBy?.name || 'Admin',
        role: n.createdBy?.role?.name || 'admin'
      }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notices
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update class details
// @route   PUT /api/admin/classes/:id
export const updateClass = async (req, res) => {
  const { name, sections, classTeacher, subjects } = req.body;
  try {
    const schoolClass = await Class.findById(req.params.id);
    if (!schoolClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (name) schoolClass.name = name;
    if (sections) schoolClass.sections = sections;
    if (classTeacher !== undefined) schoolClass.classTeacher = classTeacher || undefined;
    
    if (subjects && Array.isArray(subjects)) {
      const updatedSubjects = [];
      for (const s of subjects) {
        let subDoc = await Subject.findOne({ name: s.name });
        if (!subDoc) {
          const code = s.name.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
          subDoc = new Subject({ name: s.name, code });
          await subDoc.save();
        }
        updatedSubjects.push({
          subject: subDoc._id,
          teacher: s.teacher?._id || s.teacher || null
        });
      }
      schoolClass.subjects = updatedSubjects;
    }

    await schoolClass.save();

    const updated = await Class.findById(req.params.id)
      .populate('classTeacher', 'name email')
      .populate('subjects.subject')
      .populate('subjects.teacher', 'name email');

    res.json({
      _id: updated._id,
      name: updated.name,
      sections: updated.sections,
      classTeacher: updated.classTeacher,
      subjects: updated.subjects.map(s => ({
        name: s.subject?.name || 'Subject',
        teacher: s.teacher
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete class
// @route   DELETE /api/admin/classes/:id
export const deleteClass = async (req, res) => {
  try {
    const schoolClass = await Class.findById(req.params.id);
    if (!schoolClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get list of all subjects
// @route   GET /api/admin/subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
