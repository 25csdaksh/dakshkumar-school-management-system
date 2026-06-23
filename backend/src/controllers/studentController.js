import User from '../models/User.js';
import Student from '../models/Student.js';
import Role from '../models/Role.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import Homework from '../models/Homework.js';


// @desc    Admin: Register a new student
export const createStudent = async (req, res) => {
  const { name, email, password, phone, studentInfo } = req.body;
  const { rollNumber, classId, parentEmail, section } = studentInfo || {};

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Lookup Student Role ID
    const roleDoc = await Role.findOne({ name: 'student' });
    if (!roleDoc) {
      return res.status(500).json({ message: 'Student role not found in system' });
    }

    // 1. Create User
    const user = new User({
      name,
      email,
      password,
      role: roleDoc._id,
      phone
    });
    const savedUser = await user.save();

    // 2. Create Student details
    const student = new Student({
      user: savedUser._id,
      name: savedUser.name,
      rollNumber,
      classId,
      section: section || 'A',
      parentEmail
    });
    await student.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: 'student',
      phone: savedUser.phone,
      studentInfo: {
        rollNumber,
        classId,
        section: student.section,
        parentEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get list of all students
export const getStudents = async (req, res) => {
  try {
    const studentDocs = await Student.find({})
      .populate('user', '-password')
      .populate('classId');

    const formatted = studentDocs.map(doc => {
      if (!doc.user) return null;
      return {
        _id: doc.user._id,
        name: doc.user.name,
        email: doc.user.email,
        role: 'student',
        phone: doc.user.phone,
        profilePicture: doc.user.profilePicture,
        studentInfo: {
          rollNumber: doc.rollNumber,
          classId: doc.classId,
          section: doc.section || 'A',
          parentEmail: doc.parentEmail
        }
      };
    }).filter(s => s !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete student
export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const studentDoc = await Student.findOne({ user: id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    await Student.findByIdAndDelete(studentDoc._id);
    await User.findByIdAndDelete(id);

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for student
export const getStudentDashboard = async (req, res) => {
  const studentUserId = req.user.role.name === 'student' ? req.user._id : req.query.studentId;

  if (!studentUserId) {
    return res.status(400).json({ message: 'Student User ID is required' });
  }

  try {
    const user = await User.findById(studentUserId);
    const studentDoc = await Student.findOne({ user: studentUserId }).populate('classId');
    
    if (!user || !studentDoc) {
      return res.status(404).json({ message: 'Student records not found' });
    }

    // Attendance stats
    const totalDays = await Attendance.countDocuments({ student: studentUserId });
    const presentDays = await Attendance.countDocuments({ student: studentUserId, status: 'Present' });
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Grades (Results)
    const grades = await Result.find({ student: studentUserId }).populate('subjectId').populate('examId').sort({ createdAt: -1 }).limit(5);
    const formattedGrades = grades.map(g => ({
      _id: g._id,
      subjectName: g.subjectId?.name || 'Subject',
      examName: g.examId?.name || g.examName || 'Exam',
      marksObtained: g.marksObtained,
      maxMarks: g.maxMarks,
      remarks: g.remarks
    }));

    // Invoices
    const fees = await Fee.find({ student: studentUserId }).sort({ dueDate: 1 });

    // Notices
    const notices = await Notice.find({
      targetAudience: { $in: ['All', 'Students', 'Parents'] }
    }).sort({ createdAt: -1 }).limit(5);

    res.json({
      student: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        studentInfo: {
          rollNumber: studentDoc.rollNumber,
          classId: studentDoc.classId,
          parentEmail: studentDoc.parentEmail
        }
      },
      stats: {
        totalDays,
        presentDays,
        attendancePercentage
      },
      grades: formattedGrades,
      fees,
      notices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed attendance list for student
export const getStudentAttendance = async (req, res) => {
  const studentUserId = req.user.role.name === 'student' ? req.user._id : req.query.studentId;
  try {
    const logs = await Attendance.find({ student: studentUserId })
      .populate('classId', 'name')
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed results list for student
export const getStudentGrades = async (req, res) => {
  const studentUserId = req.user.role.name === 'student' ? req.user._id : req.query.studentId;
  try {
    const logs = await Result.find({ student: studentUserId }).populate('subjectId').populate('examId').sort({ createdAt: -1 });
    const formatted = logs.map(g => ({
      _id: g._id,
      subjectName: g.subjectId?.name || 'Subject',
      examName: g.examId?.name || g.examName || 'Exam',
      marksObtained: g.marksObtained,
      maxMarks: g.maxMarks,
      remarks: g.remarks
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills list for student
export const getStudentFees = async (req, res) => {
  const studentUserId = req.user.role.name === 'student' ? req.user._id : req.query.studentId;
  try {
    const bills = await Fee.find({ student: studentUserId }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Parent: Get kids list linked by email
export const getParentDashboard = async (req, res) => {
  try {
    const studentDocs = await Student.find({ parentEmail: req.user.email })
      .populate('user', '-password')
      .populate('classId');

    const formatted = studentDocs.map(doc => {
      if (!doc.user) return null;
      return {
        _id: doc.user._id,
        name: doc.user.name,
        email: doc.user.email,
        studentInfo: {
          rollNumber: doc.rollNumber,
          classId: doc.classId,
          parentEmail: doc.parentEmail
        }
      };
    }).filter(c => c !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get homework assignments list for student
// @route   GET /api/student/homework
export const getStudentHomework = async (req, res) => {
  const studentUserId = req.user.role.name === 'student' ? req.user._id : req.query.studentId;

  if (!studentUserId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const studentDoc = await Student.findOne({ user: studentUserId });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    const homeworkList = await Homework.find({ classId: studentDoc.classId })
      .populate('subjectId')
      .populate('teacherId', 'name')
      .sort({ dueDate: 1 });

    const formatted = homeworkList.map(hw => ({
      _id: hw._id,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate,
      subjectName: hw.subjectId?.name || 'Subject',
      teacherName: hw.teacherId?.name || 'Teacher'
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update student details
// @route   PUT /api/student/:id
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, studentInfo } = req.body;
  const { rollNumber, classId, parentEmail, parentName, parentPhone, bloodGroup, aadhaarNumber, section } = studentInfo || {};

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Student user not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    const student = await Student.findOne({ user: id });
    if (!student) return res.status(404).json({ message: 'Student details not found' });

    student.name = user.name;
    student.rollNumber = rollNumber || student.rollNumber;
    student.classId = classId || student.classId;
    student.section = section || student.section;
    student.parentEmail = parentEmail || student.parentEmail;
    student.parentName = parentName || student.parentName;
    student.parentPhone = parentPhone || student.parentPhone;
    student.bloodGroup = bloodGroup || student.bloodGroup;
    student.aadhaarNumber = aadhaarNumber || student.aadhaarNumber;
    await student.save();

    res.json({ message: 'Student updated successfully', data: { user, student } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
