import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Role from '../models/Role.js';
import Subject from '../models/Subject.js';
import ActivityLog from '../models/ActivityLog.js';
import Notice from '../models/Notice.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('role');
    if (!user || !(await user.comparePassword(password))) {
      await ActivityLog.create({
        email,
        action: 'Login Failed',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const roleName = user.role?.name || 'student';

    await ActivityLog.create({
      user: user._id,
      email,
      action: 'Login Success',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    let studentInfo = null;
    let teacherInfo = null;

    if (roleName === 'student') {
      const studentDoc = await Student.findOne({ user: user._id }).populate('classId');
      if (studentDoc) {
        studentInfo = {
          rollNumber: studentDoc.rollNumber,
          classId: studentDoc.classId,
          parentEmail: studentDoc.parentEmail
        };
      }
    } else if (roleName === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: user._id });
      if (teacherDoc) {
        teacherInfo = {
          qualification: teacherDoc.qualification,
          subjects: teacherDoc.subjects,
          salary: teacherDoc.salary
        };
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: roleName, // return role name string for frontend compatibility
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      studentInfo,
      teacherInfo,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roleName = user.role?.name || 'student';

    let studentInfo = null;
    let teacherInfo = null;

    if (roleName === 'student') {
      const studentDoc = await Student.findOne({ user: user._id }).populate('classId');
      if (studentDoc) {
        studentInfo = studentDoc;
      }
    } else if (roleName === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: user._id });
      if (teacherDoc) {
        teacherInfo = teacherDoc;
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: roleName,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      studentInfo,
      teacherInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.file) {
        user.profilePicture = req.file.path || `/uploads/${req.file.filename}`;
      }

      const updatedUser = await user.save();
      const roleName = updatedUser.role?.name || 'student';

      let studentInfo = null;
      let teacherInfo = null;

      if (roleName === 'student') {
        const studentDoc = await Student.findOne({ user: updatedUser._id }).populate('classId');
        if (studentDoc) {
          studentDoc.name = updatedUser.name;
          if (req.body.studentInfo) {
            try {
              const info = typeof req.body.studentInfo === 'string' ? JSON.parse(req.body.studentInfo) : req.body.studentInfo;
              studentDoc.parentName = info.parentName !== undefined ? info.parentName : studentDoc.parentName;
              studentDoc.parentPhone = info.parentPhone !== undefined ? info.parentPhone : studentDoc.parentPhone;
              studentDoc.parentEmail = info.parentEmail !== undefined ? info.parentEmail : studentDoc.parentEmail;
              studentDoc.bloodGroup = info.bloodGroup !== undefined ? info.bloodGroup : studentDoc.bloodGroup;
              studentDoc.aadhaarNumber = info.aadhaarNumber !== undefined ? info.aadhaarNumber : studentDoc.aadhaarNumber;
              studentDoc.address = info.address !== undefined ? info.address : studentDoc.address;
            } catch (err) {
              console.error('Failed to parse studentInfo', err);
            }
          }
          await studentDoc.save();
          studentInfo = studentDoc;
        }
      } else if (roleName === 'teacher') {
        const teacherDoc = await Teacher.findOne({ user: updatedUser._id });
        if (teacherDoc) {
          teacherDoc.name = updatedUser.name;
          if (req.body.teacherInfo) {
            try {
              const info = typeof req.body.teacherInfo === 'string' ? JSON.parse(req.body.teacherInfo) : req.body.teacherInfo;
              teacherDoc.qualification = info.qualification !== undefined ? info.qualification : teacherDoc.qualification;
              teacherDoc.address = info.address !== undefined ? info.address : teacherDoc.address;
              teacherDoc.gender = info.gender !== undefined ? info.gender : teacherDoc.gender;
              teacherDoc.bloodGroup = info.bloodGroup !== undefined ? info.bloodGroup : teacherDoc.bloodGroup;
            } catch (err) {
              console.error('Failed to parse teacherInfo', err);
            }
          }
          await teacherDoc.save();
          teacherInfo = teacherDoc;
        }
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: roleName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
        studentInfo,
        teacherInfo,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Student, Teacher, Parent) publicly
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, phone, role, studentInfo, teacherInfo } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Lookup Role
    const roleDoc = await Role.findOne({ name: role.toLowerCase() });
    if (!roleDoc) {
      return res.status(400).json({ message: `Invalid role selected: ${role}` });
    }

    // 1. Create primary User account
    const user = new User({
      name,
      email,
      password,
      role: roleDoc._id,
      phone
    });
    const savedUser = await user.save();

    // Log successful signup
    await ActivityLog.create({
      user: savedUser._id,
      email,
      action: 'Signup',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // 2. Role-specific collection mappings
    let studentDetails = null;
    let teacherDetails = null;

    if (role.toLowerCase() === 'student') {
      const { rollNumber, classId, parentEmail } = studentInfo || {};
      const student = new Student({
        user: savedUser._id,
        name: savedUser.name,
        rollNumber: rollNumber || `ST-${Math.floor(100 + Math.random() * 900)}`,
        classId: classId || undefined,
        parentEmail
      });
      await student.save();
      studentDetails = {
        rollNumber: student.rollNumber,
        classId: student.classId,
        parentEmail: student.parentEmail
      };
    } else if (role.toLowerCase() === 'teacher') {
      const { qualification, subjects } = teacherInfo || {};
      
      const subjectIds = [];
      if (subjects && subjects.length > 0) {
        for (const subName of subjects) {
          let subDoc = await Subject.findOne({ name: subName });
          if (!subDoc) {
            const code = subName.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
            subDoc = new Subject({ name: subName, code });
            await subDoc.save();
          }
          subjectIds.push(subDoc._id);
        }
      }

      const teacher = new Teacher({
        user: savedUser._id,
        name: savedUser.name,
        qualification: qualification || 'Qualified Teacher',
        subjects: subjectIds,
        salary: 0 // starting registered teacher salary
      });
      await teacher.save();
      teacherDetails = {
        qualification: teacher.qualification,
        subjects,
        salary: 0
      };
    }

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: role.toLowerCase(),
      phone: savedUser.phone,
      profilePicture: savedUser.profilePicture,
      studentInfo: studentDetails,
      teacherInfo: teacherDetails,
      token: generateToken(savedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Retrieve all activity logs
// @route   GET /api/admin/activity-logs
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SECURITY & AUTH IMPROVEMENTS
// ==========================================

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '90d'
  });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Request Password Reset Email (simulated)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate random 4-byte token hex
    const resetToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`[PASSWORD RESET SIMULATION] Email sent to: ${email}. Reset token: ${resetToken}`);

    res.json({
      message: 'Password reset link sent (Simulated)',
      resetToken // Return token for easy local frontend verification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request OTP Code (simulated SMS/Email)
// @route   POST /api/auth/request-otp
export const requestOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    console.log(`[OTP SIMULATION] Code for ${email} is: ${otp}`);

    res.json({
      message: 'OTP Code sent successfully (Simulated)',
      otpCode: otp // Return for ease of testing in frontend sandbox
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and log in user
// @route   POST /api/auth/verify-otp
export const verifyOtpLogin = async (req, res) => {
  const { email, otpCode } = req.body;
  try {
    const user = await User.findOne({
      email,
      otpCode,
      otpExpire: { $gt: Date.now() }
    }).populate('role');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Clear OTP details
    user.otpCode = undefined;
    user.otpExpire = undefined;
    
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const roleName = user.role?.name || 'student';

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: roleName,
      phone: user.phone,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle 2FA state
// @route   POST /api/auth/toggle-2fa
export const toggleTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    if (user.isTwoFactorEnabled) {
      // Simulate secret assignment
      user.twoFactorSecret = 'SECRET_KEY_' + Math.random().toString(36).substring(7).toUpperCase();
    } else {
      user.twoFactorSecret = undefined;
    }
    await user.save();

    res.json({
      message: `2FA ${user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}`,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user role-filtered notifications
// @route   GET /api/auth/notifications
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const roleName = user.role?.name || 'student';
    
    let audiences = ['All'];
    if (roleName === 'student') {
      audiences.push('Students');
    } else if (roleName === 'parent') {
      audiences.push('Parents', 'Students');
    } else if (roleName === 'teacher') {
      audiences.push('Teachers');
    } else if (roleName === 'admin') {
      audiences.push('Teachers', 'Students', 'Parents');
    }

    const notifications = await Notice.find({
      targetAudience: { $in: audiences }
    }).sort({ createdAt: -1 }).limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

