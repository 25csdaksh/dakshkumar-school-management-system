import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';

// @desc    Teacher: Input/Update grade marks for student exam
export const addOrUpdateGrade = async (req, res) => {
  const { studentId, classId, subjectName, examName, marksObtained, maxMarks, remarks } = req.body;

  try {
    // 1. Resolve Subject reference ID
    let subDoc = await Subject.findOne({ name: subjectName });
    if (!subDoc) {
      const code = subjectName.toUpperCase().slice(0, 4) + Math.round(Math.random() * 100);
      subDoc = new Subject({ name: subjectName, code });
      await subDoc.save();
    }

    // 2. Resolve Exam reference ID
    let examDoc = await Exam.findOne({ name: examName, classId });
    if (!examDoc) {
      examDoc = new Exam({
        name: examName,
        classId,
        term: 'Term 1',
        startDate: new Date()
      });
      await examDoc.save();
    }

    // Check if result already exists for student, subject, exam
    let result = await Result.findOne({ student: studentId, subjectId: subDoc._id, examId: examDoc._id });

    if (result) {
      result.marksObtained = marksObtained;
      result.maxMarks = maxMarks;
      result.remarks = remarks;
      result.gradedBy = req.user._id;
      await result.save();
    } else {
      result = new Result({
        student: studentId,
        classId,
        subjectId: subDoc._id,
        examId: examDoc._id,
        examName: examDoc.name, // keep string fallback
        marksObtained,
        maxMarks,
        remarks,
        gradedBy: req.user._id
      });
      await result.save();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher/Admin: Retrieve grade listings
export const getGradesByClass = async (req, res) => {
  const { classId } = req.params;
  const { subjectName, examName } = req.query;

  try {
    const filter = { classId };

    // Resolve subject if specified in query
    if (subjectName) {
      const sub = await Subject.findOne({ name: subjectName });
      if (sub) filter.subjectId = sub._id;
    }

    // Resolve exam if specified in query
    if (examName) {
      const exam = await Exam.findOne({ name: examName, classId });
      if (exam) filter.examId = exam._id;
    }

    const results = await Result.find(filter)
      .populate('student', 'name email')
      .populate('subjectId')
      .populate('examId')
      .populate('gradedBy', 'name');

    const studentDocs = await Student.find({ classId });
    const rollMap = {};
    const sectionMap = {};
    studentDocs.forEach(s => {
      if (s.user) {
        rollMap[s.user.toString()] = s.rollNumber;
        sectionMap[s.user.toString()] = s.section || 'A';
      }
    });

    let formatted = results.map(rec => {
      if (!rec.student) return null;
      const studentUserId = rec.student._id.toString();
      return {
        _id: rec._id,
        subjectName: rec.subjectId?.name || 'Subject',
        examName: rec.examId?.name || rec.examName || 'Exam',
        marksObtained: rec.marksObtained,
        maxMarks: rec.maxMarks,
        remarks: rec.remarks,
        gradedBy: rec.gradedBy,
        student: {
          _id: rec.student._id,
          name: rec.student.name,
          email: rec.student.email,
          studentInfo: {
            rollNumber: rollMap[studentUserId] || '-',
            section: sectionMap[studentUserId] || 'A'
          }
        }
      };
    }).filter(r => r !== null);

    const { section } = req.query;
    if (section && section !== 'All') {
      formatted = formatted.filter(r => r.student.studentInfo.section === section);
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
