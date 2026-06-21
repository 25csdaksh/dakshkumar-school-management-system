import AcademicYear from '../models/AcademicYear.js';
import Timetable from '../models/Timetable.js';
import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

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
