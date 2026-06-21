import Result from '../models/Result.js';
import Subject from '../models/Subject.js';

// @desc    Analyze student results via Gemini API or local fallback engine
// @route   POST /api/ai/analyze-report
export const analyzeReportCard = async (req, res) => {
  const { studentId } = req.body;
  try {
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // Retrieve student grades
    const grades = await Result.find({ student: studentId }).populate('subjectId');
    if (grades.length === 0) {
      return res.json({
        analysis: "Insufficient examination data found for this student to generate an AI performance analysis."
      });
    }

    // Prepare grades string for prompt
    const gradesSummary = grades.map(g => {
      const subjectName = g.subjectId?.name || 'Subject';
      return `${subjectName}: Marks ${g.marksObtained}/${g.maxMarks} (Remarks: "${g.remarks || 'None'}")`;
    }).join('\n');

    const prompt = `Analyze the following academic grades for a student and provide a concise, constructive 3-line feedback summary containing:
1. Areas of strength.
2. Areas of weakness or needed improvement.
3. Actionable study tips.

Student Grades:
${gradesSummary}`;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.json({ analysis: text.trim() });
          }
        }
      } catch (err) {
        console.error('Gemini API call failed, reverting to local engine:', err.message);
      }
    }

    // Local Fallback analysis engine
    const strengths = [];
    const weaknesses = [];
    
    grades.forEach(g => {
      const subjectName = g.subjectId?.name || 'Subject';
      const pct = (g.marksObtained / g.maxMarks) * 100;
      if (pct >= 80) {
        strengths.push(subjectName);
      } else if (pct < 60) {
        weaknesses.push(subjectName);
      }
    });

    let localAnalysis = "Academic Performance Summary:\n";
    if (strengths.length > 0) {
      localAnalysis += `• Strong conceptual understanding demonstrated in ${strengths.join(', ')}.\n`;
    } else {
      localAnalysis += `• Maintaining average standing across current subjects.\n`;
    }
    if (weaknesses.length > 0) {
      localAnalysis += `• Requires extra practice and focused tutorial reviews in ${weaknesses.join(', ')}.\n`;
    } else {
      localAnalysis += `• Satisfactory performance. Continue consistent weekly reviews to maintain marks.\n`;
    }
    localAnalysis += `• Recommendation: Participate in mock test series and establish 30-minute daily review sessions.`;

    res.json({ analysis: localAnalysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify timetable periods collision check
// @route   POST /api/ai/resolve-timetable
export const checkTimetableConflicts = async (req, res) => {
  const { periods } = req.body;
  try {
    if (!periods || !Array.isArray(periods)) {
      return res.status(400).json({ message: 'periods array is required' });
    }

    const conflicts = [];
    
    // Check overlaps
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const p1 = periods[i];
        const p2 = periods[j];
        
        // Simple string time comparison e.g. "08:30"
        const start1 = p1.startTime;
        const end1 = p1.endTime;
        const start2 = p2.startTime;
        const end2 = p2.endTime;

        const overlaps = (start1 < end2 && start2 < end1);

        if (overlaps) {
          if (p1.teacher === p2.teacher && p1.teacher) {
            conflicts.push(`Teacher collision: same teacher is assigned to multiple classes between ${start1} and ${end1}`);
          }
          if (p1.subject === p2.subject && p1.subject) {
            conflicts.push(`Subject scheduling duplicate at the same period interval (${start1} to ${end1})`);
          }
        }
      }
    }

    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.length > 0 ? conflicts : ["No scheduling or teacher assignment conflicts identified."]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
