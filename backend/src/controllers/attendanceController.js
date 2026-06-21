import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Teacher: Mark/Record attendance for class section
// @route   POST /api/teacher/attendance
export const markAttendance = async (req, res) => {
  const { classId, section, date, attendanceData } = req.body;

  try {
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const operations = attendanceData.map(record => ({
      updateOne: {
        filter: { student: record.studentId, date: formattedDate },
        update: {
          student: record.studentId,
          classId,
          section,
          date: formattedDate,
          status: record.status,
          markedBy: req.user._id
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher/Admin: Retrieve attendance logs
// @route   GET /api/teacher/classes/:classId/attendance
export const getAttendanceRecord = async (req, res) => {
  const { classId } = req.params;
  const { section, date } = req.query;

  try {
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const attendanceList = await Attendance.find({
      classId,
      section,
      date: formattedDate
    }).populate('student', 'name email');

    // Load roll numbers
    const studentDocs = await Student.find({ classId });
    const rollMap = {};
    studentDocs.forEach(s => {
      rollMap[s.user.toString()] = s.rollNumber;
    });

    const formatted = attendanceList.map(rec => {
      if (!rec.student) return null;
      return {
        _id: rec._id,
        date: rec.date,
        status: rec.status,
        student: {
          _id: rec.student._id,
          name: rec.student.name,
          email: rec.student.email,
          studentInfo: {
            rollNumber: rollMap[rec.student._id.toString()] || '-'
          }
        }
      };
    }).filter(r => r !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hardware Biometric Webhook: Log check-in scan
// @route   POST /api/attendance/biometric
export const logBiometricAttendance = async (req, res) => {
  const { rollNumber, status, date } = req.body;

  try {
    const formattedDate = date ? new Date(date) : new Date();
    formattedDate.setHours(0, 0, 0, 0);

    // 1. Find Student by roll number
    const studentDoc = await Student.findOne({ rollNumber });
    if (!studentDoc) {
      return res.status(404).json({ message: `Student with Roll Number ${rollNumber} not found` });
    }

    // 2. Perform upsert attendance log
    const log = await Attendance.findOneAndUpdate(
      { student: studentDoc.user, date: formattedDate },
      {
        student: studentDoc.user,
        classId: studentDoc.classId,
        section: 'A', // default section
        date: formattedDate,
        status: status || 'Present',
        markedBy: studentDoc.user // System auto-marked
      },
      { upsert: true, new: true }
    );

    console.log(`[BIOMETRIC-API] Attendance marked for Student: ${rollNumber} -> Status: ${status || 'Present'}`);
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
