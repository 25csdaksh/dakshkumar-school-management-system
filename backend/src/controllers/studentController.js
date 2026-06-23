import User from '../models/User.js';
import Student from '../models/Student.js';
import Role from '../models/Role.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import Homework from '../models/Homework.js';
import Class from '../models/Class.js';
import xlsx from 'xlsx';


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

// @desc    Admin: Import students from Excel/CSV
// @route   POST /api/student/admin/import
export const importStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded file is empty' });
    }

    const validationErrors = [];
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      return res.status(500).json({ message: 'Student role not found in system' });
    }

    // Phase 1: Validate rows
    const rowsToProcess = [];
    const seenGrNos = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // Row number in Excel sheet (1-indexed + header row)

      // Normalize fields
      const grNoRaw = row['GR No'] || row['GR Number'] || row['Roll Number'] || row['grNo'] || row['Gr No'] || row['id'] || row['ID'] || row['GrNo'] || row['Gr number'] || row['Roll number'];
      const grNo = grNoRaw ? String(grNoRaw).trim() : '';

      const nameRaw = row['Name'] || row['name'] || row['Full Name'] || row['Student Name'] || row['fullName'] || row['studentName'];
      const name = nameRaw ? String(nameRaw).trim() : '';

      const classNameRaw = row['Class'] || row['class'] || row['Grade'] || row['Grade Class'] || row['grade'] || row['className'];
      const className = classNameRaw ? String(classNameRaw).trim() : '';

      const sectionRaw = row['Section'] || row['section'] || row['Division'] || row['division'] || 'A';
      const section = String(sectionRaw).trim().toUpperCase();

      const parentEmailRaw = row['Parent Email'] || row['parentEmail'] || row['Parent’s Email'] || row['Parent\'s Email'] || row['parentemail'] || row['Parent email'];
      const parentEmail = parentEmailRaw ? String(parentEmailRaw).trim().toLowerCase() : '';

      const phoneRaw = row['Phone'] || row['phone'] || row['Contact'] || row['Mobile'] || row['phoneNo'] || row['phone_number'];
      const phone = phoneRaw ? String(phoneRaw).trim() : '';

      // Check required fields
      if (!grNo) {
        validationErrors.push(`Row ${rowIndex}: GR No (Student ID) is missing.`);
      }
      if (!name) {
        validationErrors.push(`Row ${rowIndex}: Student Name is missing.`);
      }
      if (!className) {
        validationErrors.push(`Row ${rowIndex}: Class Name is missing.`);
      }

      if (!grNo || !name || !className) {
        continue; // skip further checks for this row
      }

      // Check duplicates in the uploaded sheet
      if (seenGrNos.has(grNo)) {
        validationErrors.push(`Row ${rowIndex}: Duplicate GR No "${grNo}" found in the uploaded file.`);
      } else {
        seenGrNos.add(grNo);
      }

      // Resolve class
      const classDoc = await Class.findOne({ name: new RegExp('^' + className.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') });
      if (!classDoc) {
        validationErrors.push(`Row ${rowIndex}: Class "${className}" was not found in the database.`);
        continue;
      }

      rowsToProcess.push({
        grNo,
        name,
        classId: classDoc._id,
        className: classDoc.name,
        section,
        parentEmail,
        phone
      });
    }

    // If there are validation errors, return them immediately
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Phase 2: Process valid rows
    const createdCredentials = [];
    let skippedCount = 0;

    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let pwd = '';
      for (let i = 0; i < 8; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pwd;
    };

    for (const data of rowsToProcess) {
      // Check if student already exists by GR number (rollNumber)
      const existingStudent = await Student.findOne({ rollNumber: data.grNo });
      if (existingStudent) {
        skippedCount++;
        continue;
      }

      // Check if user already exists by generated email
      const studentEmail = `${data.grNo}@school.com`;
      const existingUser = await User.findOne({ email: studentEmail });
      if (existingUser) {
        skippedCount++;
        continue;
      }

      const tempPassword = generateRandomPassword();

      // 1. Create User
      const user = new User({
        name: data.name,
        email: studentEmail,
        password: tempPassword,
        role: studentRole._id,
        phone: data.phone || '',
        isFirstLogin: true
      });
      const savedUser = await user.save();

      // 2. Create Student
      const student = new Student({
        user: savedUser._id,
        name: savedUser.name,
        rollNumber: data.grNo,
        classId: data.classId,
        section: data.section,
        parentEmail: data.parentEmail || `parent_${data.grNo}@school.com`
      });
      await student.save();

      createdCredentials.push({
        'GR No (Student ID)': data.grNo,
        'Student Name': data.name,
        'Grade Class': data.className,
        'Section': data.section,
        'Generated Email': studentEmail,
        'Temporary Password': tempPassword
      });
    }

    // Phase 3: Respond with credentials spreadsheet or message
    if (createdCredentials.length === 0) {
      return res.json({ 
        message: `Import complete. All ${rowsToProcess.length} students already exist. No new accounts created.`, 
        skippedCount 
      });
    }

    // Create a new Excel workbook
    const ws = xlsx.utils.json_to_sheet(createdCredentials);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Credentials');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_credentials.xlsx');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
