import AcademicYear from '../models/AcademicYear.js';
import Timetable from '../models/Timetable.js';
import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Exam from '../models/Exam.js';
import Homework from '../models/Homework.js';
import Subject from '../models/Subject.js';

// ==========================================
// 1. ACADEMIC YEAR
// ==========================================
export const createAcademicYear = async (req, res) => {
  try {
    const { year, startDate, endDate, isActive } = req.body;
    
    if (isActive) {
      // Set all other years to inactive
      await AcademicYear.updateMany({}, { isActive: false });
    }

    const newYear = new AcademicYear({ year, startDate, endDate, isActive });
    await newYear.save();

    res.status(201).json({ message: 'Academic Year created successfully', data: newYear });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ year: -1 });
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setActiveAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    await AcademicYear.updateMany({}, { isActive: false });
    const updated = await AcademicYear.findByIdAndUpdate(id, { isActive: true }, { new: true });
    res.json({ message: 'Active academic year updated', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. TIMETABLE
// ==========================================
export const getTimetableByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { section } = req.query;
    
    const query = { classId };
    if (section) query.section = section;

    const schedules = await Timetable.find(query)
      .populate('periods.subject')
      .populate('periods.teacher', 'name email');

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateTimetable = async (req, res) => {
  try {
    const { classId, section, day, periods } = req.body;

    let timetable = await Timetable.findOne({ classId, section, day });

    if (timetable) {
      timetable.periods = periods;
      await timetable.save();
    } else {
      timetable = new Timetable({ classId, section, day, periods });
      await timetable.save();
    }

    res.status(201).json({ message: 'Timetable updated successfully', data: timetable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. STUDENT PROMOTION
// ==========================================
export const promoteStudents = async (req, res) => {
  try {
    const { fromClassId, toClassId } = req.body;

    if (!fromClassId || !toClassId) {
      return res.status(400).json({ message: 'Both fromClassId and toClassId are required' });
    }

    const fromClass = await Class.findById(fromClassId);
    const toClass = await Class.findById(toClassId);

    if (!fromClass || !toClass) {
      return res.status(404).json({ message: 'One or both classes not found' });
    }

    // Promote all students currently in fromClass to toClass
    const result = await Student.updateMany(
      { classId: fromClassId },
      { classId: toClassId }
    );

    res.json({
      message: `Successfully promoted students from ${fromClass.name} to ${toClass.name}`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. CERTIFICATE ISSUANCE (TC & BONAFIDE)
// ==========================================
export const issueCertificate = async (req, res) => {
  try {
    const { studentId, type, details } = req.body;

    if (!studentId || !type) {
      return res.status(400).json({ message: 'studentId and type are required' });
    }

    const student = await Student.findById(studentId).populate('user', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Student records not found' });
    }

    const certificateNumber = `CERT-${type}-${Date.now()}`;
    const certificate = new Certificate({
      student: studentId,
      type,
      certificateNumber,
      details,
      issuedBy: req.user._id
    });

    await certificate.save();

    res.status(201).json({
      message: `${type} Certificate issued successfully`,
      data: certificate,
      studentName: student.user.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('issuedBy', 'name');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 5. UPDATE ACADEMIC YEAR
// ==========================================
export const updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, startDate, endDate, isActive } = req.body;

    if (isActive) {
      // Set all other years to inactive
      await AcademicYear.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const updated = await AcademicYear.findByIdAndUpdate(
      id,
      { year, startDate, endDate, isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }

    res.json({ message: 'Academic year updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 6. EXAM SCHEDULES
// ==========================================
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('classId', 'name');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExam = async (req, res) => {
  try {
    const { name, classId, term, startDate } = req.body;
    const newExam = new Exam({ name, classId, term, startDate });
    await newExam.save();
    
    const populated = await Exam.findById(newExam._id).populate('classId', 'name');
    res.status(201).json({ message: 'Exam schedule created successfully', data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, classId, term, startDate } = req.body;
    const updated = await Exam.findByIdAndUpdate(
      id,
      { name, classId, term, startDate },
      { new: true }
    ).populate('classId', 'name');

    if (!updated) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.json({ message: 'Exam schedule updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Exam.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.json({ message: 'Exam schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 7. HOMEWORK LOGS
// ==========================================
export const getHomeworkList = async (req, res) => {
  try {
    const { classId, section } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (section) query.section = section;

    const homeworkList = await Homework.find(query)
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .sort({ dueDate: 1 });

    const formatted = homeworkList.map(hw => ({
      _id: hw._id,
      title: hw.title,
      description: hw.description,
      className: hw.classId?.name || 'Unknown Class',
      subject: hw.subjectId?.name || 'Subject',
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : '',
      teacher: hw.teacherId?.name || 'Teacher',
      section: hw.section || 'A'
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHomework = async (req, res) => {
  try {
    const { title, description, classId, subjectId, section, dueDate } = req.body;
    
    if (!title || !description || !classId || !subjectId || !dueDate) {
      return res.status(400).json({ message: 'All homework fields are required' });
    }

    const homework = new Homework({
      title,
      description,
      classId,
      subjectId,
      section: section || 'A',
      dueDate,
      teacherId: req.user._id
    });

    await homework.save();

    res.status(201).json({ message: 'Homework created successfully', data: homework });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, classId, subjectId, section, dueDate } = req.body;

    const updated = await Homework.findByIdAndUpdate(
      id,
      { title, description, classId, subjectId, section: section || 'A', dueDate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    res.json({ message: 'Homework updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Homework.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    res.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 8. WEEKLY BULK TIMETABLE SAVE
// ==========================================
export const saveBulkTimetable = async (req, res) => {
  try {
    const { classId, section, schedules } = req.body;

    if (!classId || !section || !schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ message: 'Invalid payload for bulk timetable save' });
    }

    for (const sched of schedules) {
      const { day, periods } = sched;
      // Filter out invalid periods (periods that have no subject or teacher assigned)
      const validPeriods = periods.filter(p => p.subject && p.teacher);
      
      // Update or create
      await Timetable.findOneAndUpdate(
        { classId, section, day },
        { periods: validPeriods },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ message: 'Weekly timetable bulk saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
