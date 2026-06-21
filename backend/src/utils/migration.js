import Student from '../models/Student.js';
import User from '../models/User.js';

export const migrateStudentNames = async () => {
  try {
    console.log('Running student name migration check...');
    
    // Find all students where name is missing, null, or empty
    const studentsWithoutName = await Student.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: '' }
      ]
    });

    if (studentsWithoutName.length === 0) {
      console.log('All student records have name populated. No migration needed.');
      return;
    }

    console.log(`Found ${studentsWithoutName.length} student records without name. Migrating...`);

    let successCount = 0;
    for (const student of studentsWithoutName) {
      const user = await User.findById(student.user);
      if (user) {
        student.name = user.name;
        await student.save();
        successCount++;
        console.log(`Successfully migrated name "${user.name}" for student ID ${student._id}`);
      } else {
        console.warn(`Warning: User record not found for student ID ${student._id} with user ID ${student.user}`);
      }
    }

    console.log(`Student name migration completed. Migrated ${successCount}/${studentsWithoutName.length} records.`);
  } catch (error) {
    console.error('Error running student name migration:', error);
  }
};
