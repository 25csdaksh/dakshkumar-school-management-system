import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Notice from '../models/Notice.js';

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

    // Sync absence notices for parents
    const studentUserIds = attendanceData.map(r => r.studentId);
    const studentDocs = await Student.find({ user: { $in: studentUserIds } });
    const studentMap = {};
    studentDocs.forEach(s => {
      studentMap[s.user.toString()] = s;
    });

    const startOfDay = new Date(formattedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingNotices = await Notice.find({
      targetUser: { $in: studentUserIds },
      title: new RegExp('^Absence Alert:', 'i'),
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const noticeMap = {};
    existingNotices.forEach(n => {
      noticeMap[n.targetUser.toString()] = n;
    });

    const noticesToCreate = [];
    const noticesToDeleteUserIds = [];

    for (const record of attendanceData) {
      const studentUserId = record.studentId.toString();
      const status = record.status;

      if (status === 'Absent') {
        if (!noticeMap[studentUserId]) {
          const studentDoc = studentMap[studentUserId];
          const studentName = studentDoc ? studentDoc.name : 'Student';
          const rollNumber = studentDoc ? studentDoc.rollNumber : '-';

          noticesToCreate.push({
            title: `Absence Alert: ${studentName} / ગેરહાજર સૂચના: ${studentName}`,
            content: `${studentName} (Roll No: ${rollNumber}) was marked absent on ${formattedDate.toLocaleDateString()}.`,
            targetAudience: 'Parents',
            targetUser: record.studentId,
            createdBy: req.user._id
          });
        }
      } else {
        // Status is Present or Late, delete today's notice if it exists
        if (noticeMap[studentUserId]) {
          noticesToDeleteUserIds.push(record.studentId);
        }
      }
    }

    if (noticesToCreate.length > 0) {
      await Notice.insertMany(noticesToCreate);
    }
    if (noticesToDeleteUserIds.length > 0) {
      await Notice.deleteMany({
        targetUser: { $in: noticesToDeleteUserIds },
        title: new RegExp('^Absence Alert:', 'i'),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
    }

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

    // Load roll numbers and genders
    const studentDocs = await Student.find({ classId });
    const rollMap = {};
    const genderMap = {};
    studentDocs.forEach(s => {
      rollMap[s.user.toString()] = s.rollNumber;
      genderMap[s.user.toString()] = s.gender || 'Male';
    });

    const formatted = attendanceList.map(rec => {
      if (!rec.student) return null;
      const studentGender = genderMap[rec.student._id.toString()] || 'Male';
      return {
        _id: rec._id,
        date: rec.date,
        status: rec.status,
        student: {
          _id: rec.student._id,
          name: rec.student.name,
          email: rec.student.email,
          gender: studentGender,
          studentInfo: {
            rollNumber: rollMap[rec.student._id.toString()] || '-',
            gender: studentGender
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

    const finalStatus = status || 'Present';

    // 2. Perform upsert attendance log
    const log = await Attendance.findOneAndUpdate(
      { student: studentDoc.user, date: formattedDate },
      {
        student: studentDoc.user,
        classId: studentDoc.classId,
        section: 'A', // default section
        date: formattedDate,
        status: finalStatus,
        markedBy: studentDoc.user // System auto-marked
      },
      { upsert: true, new: true }
    );

    // Sync absence notice for parents
    const startOfDay = new Date(formattedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (finalStatus === 'Absent') {
      const existingNotice = await Notice.findOne({
        targetUser: studentDoc.user,
        title: new RegExp('^Absence Alert:', 'i'),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      if (!existingNotice) {
        const studentName = studentDoc.name || 'Student';
        await Notice.create({
          title: `Absence Alert: ${studentName} / ગેરહાજર સૂચના: ${studentName}`,
          content: `${studentName} (Roll No: ${rollNumber}) was marked absent on ${formattedDate.toLocaleDateString()}.`,
          targetAudience: 'Parents',
          targetUser: studentDoc.user,
          createdBy: studentDoc.user
        });
      }
    } else {
      // If student is Present or Late, delete today's absence notice if it exists
      await Notice.deleteMany({
        targetUser: studentDoc.user,
        title: new RegExp('^Absence Alert:', 'i'),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
    }

    console.log(`[BIOMETRIC-API] Attendance marked for Student: ${rollNumber} -> Status: ${finalStatus}`);
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
