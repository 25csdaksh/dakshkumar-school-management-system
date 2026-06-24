import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Role from '../models/Role.js';
import Subject from '../models/Subject.js';
import LeaveApplication from '../models/LeaveApplication.js';

// @desc    Admin: Register a new teacher
export const createTeacher = async (req, res) => {
  const { name, email, password, phone, teacherInfo } = req.body;
  const { qualification, subjects, salary, designation, joiningDate, salaryDetails } = teacherInfo || {};

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Lookup Role ID
    const roleDoc = await Role.findOne({ name: 'teacher' });
    if (!roleDoc) {
      return res.status(500).json({ message: 'Teacher role not found in system' });
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

    // 2. Map subjects (string names) to Subject model IDs (find or create)
    const subjectIds = [];
    if (subjects && subjects.length > 0) {
      for (const subName of subjects) {
        let subDoc = await Subject.findOne({ name: subName });
        if (!subDoc) {
          // generate random code
          const code = subName.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
          subDoc = new Subject({ name: subName, code });
          await subDoc.save();
        }
        subjectIds.push(subDoc._id);
      }
    }

    // 3. Create Teacher details
    const teacher = new Teacher({
      user: savedUser._id,
      name: savedUser.name,
      qualification,
      subjects: subjectIds,
      salary: Number(salary) || 0,
      designation: designation || 'Assistant Teacher',
      joiningDate: joiningDate || undefined,
      salaryDetails: salaryDetails || { basic: Number(salary) || 0, allowances: 0, deductions: 0 }
    });
    await teacher.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: 'teacher',
      phone: savedUser.phone,
      teacherInfo: {
        qualification,
        subjects,
        salary,
        designation: teacher.designation,
        joiningDate: teacher.joiningDate,
        salaryDetails: teacher.salaryDetails
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get list of all teachers
export const getTeachers = async (req, res) => {
  try {
    const teacherDocs = await Teacher.find({})
      .populate('user', '-password')
      .populate('subjects');

    // Self-healing: sync teacher names back into MongoDB Teacher collection if missing
    for (const doc of teacherDocs) {
      if (doc.user && (!doc.name || doc.name !== doc.user.name)) {
        doc.name = doc.user.name;
        await doc.save();
      }
    }

    const formatted = teacherDocs.map(doc => {
      if (!doc.user) return null;
      return {
        _id: doc.user._id,
        name: doc.user.name,
        email: doc.user.email,
        role: 'teacher',
        phone: doc.user.phone,
        profilePicture: doc.user.profilePicture,
        teacherInfo: {
          qualification: doc.qualification,
          subjects: doc.subjects?.map(s => s.name) || [],
          salary: doc.salary,
          designation: doc.designation,
          joiningDate: doc.joiningDate,
          salaryDetails: doc.salaryDetails
        }
      };
    }).filter(t => t !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete teacher
export const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacherDoc = await Teacher.findOne({ user: id });
    if (!teacherDoc) {
      return res.status(404).json({ message: 'Teacher details not found' });
    }

    await Teacher.findByIdAndDelete(teacherDoc._id);
    await User.findByIdAndDelete(id);

    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher: Get classes & subjects assigned to this teacher
export const getAssignedClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      $or: [
        { classTeacher: req.user._id },
        { 'sectionTeachers.teacher': req.user._id },
        { 'subjects.teacher': req.user._id }
      ]
    })
    .populate('classTeacher', 'name email')
    .populate('sectionTeachers.teacher', 'name email')
    .populate('subjects.subject');

    // Format output to send flat names of subjects for frontend compatibility
    const formatted = await Promise.all(classes.map(async c => {
      const classSubjects = c.subjects.map(subItem => ({
        name: subItem.subject?.name || 'Subject',
        teacher: subItem.teacher
      }));
      const [studentCount, boyCount, girlCount] = await Promise.all([
        Student.countDocuments({ classId: c._id }),
        Student.countDocuments({ classId: c._id, gender: 'Male' }),
        Student.countDocuments({ classId: c._id, gender: 'Female' })
      ]);
      return {
        _id: c._id,
        name: c.name,
        sections: c.sections,
        classTeacher: c.classTeacher,
        sectionTeachers: c.sectionTeachers || [],
        subjects: classSubjects,
        studentCount,
        boyCount,
        girlCount
      };
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher: Get students in a specific class
export const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;
  const { section } = req.query;

  try {
    const filter = { classId };
    if (section) {
      filter.section = section;
    }
    const studentDocs = await Student.find(filter).populate('user', '-password');
    
    const formatted = studentDocs.map(doc => {
      if (!doc.user) return null;
      return {
        _id: doc.user._id,
        name: doc.user.name,
        email: doc.user.email,
        phone: doc.user.phone,
        gender: doc.gender || 'Male',
        studentInfo: {
          rollNumber: doc.rollNumber,
          classId: doc.classId,
          parentEmail: doc.parentEmail,
          parentName: doc.parentName,
          parentPhone: doc.parentPhone,
          bloodGroup: doc.bloodGroup,
          aadhaarNumber: doc.aadhaarNumber,
          medicalHistory: doc.medicalHistory,
          vaccinationRecords: doc.vaccinationRecords,
          gender: doc.gender || 'Male'
        }
      };
    }).filter(s => s !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher: Apply for Leave
// @route   POST /api/teacher/leaves
export const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const leave = new LeaveApplication({
      applicant: req.user._id,
      type,
      startDate,
      endDate,
      reason
    });
    await leave.save();
    res.status(201).json({ message: 'Leave application submitted successfully', data: leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher: View my leave applications
// @route   GET /api/teacher/leaves
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.find({ applicant: req.user._id })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: View all leave applications
// @route   GET /api/teacher/leaves/admin
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.find()
      .populate('applicant', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Review leave application (approve/reject)
// @route   PUT /api/teacher/leaves/admin/:id
export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    leave.status = status;
    leave.comments = comments;
    leave.approvedBy = req.user._id;
    await leave.save();

    res.json({ message: `Leave application status updated to ${status}`, data: leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher: Get salary slip details
// @route   GET /api/teacher/salary
export const getSalaryDetails = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    res.json(teacher.salaryDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Update teacher details
// @route   PUT /api/teacher/:id
export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, teacherInfo } = req.body;
  const { qualification, salary, designation, subjects } = teacherInfo || {};

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Teacher user not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    const teacher = await Teacher.findOne({ user: id });
    if (!teacher) return res.status(404).json({ message: 'Teacher details not found' });

    if (subjects !== undefined) {
      const subjectIds = [];
      for (const subName of subjects) {
        let subDoc = await Subject.findOne({ name: subName });
        if (!subDoc) {
          const code = subName.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
          subDoc = new Subject({ name: subName, code });
          await subDoc.save();
        }
        subjectIds.push(subDoc._id);
      }
      teacher.subjects = subjectIds;
    }

    teacher.name = name || user.name;
    teacher.qualification = qualification || teacher.qualification;
    teacher.salary = salary !== undefined ? Number(salary) : teacher.salary;
    teacher.designation = designation || teacher.designation;
    await teacher.save();

    res.json({ message: 'Teacher updated successfully', data: { user, teacher } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Delete leave application
// @route   DELETE /api/teacher/leaves/admin/:id
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    await LeaveApplication.findByIdAndDelete(id);

    res.json({ message: 'Leave application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

