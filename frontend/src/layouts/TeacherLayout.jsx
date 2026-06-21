import React from 'react';
import BaseLayout from './BaseLayout.jsx';

export const TeacherLayout = ({ children }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Attendance logs', path: '/teacher/attendance', icon: 'attendance' },
    { label: 'Exam Grades', path: '/teacher/marks', icon: 'exams' },
    { label: 'Homework Logs', path: '/teacher/homework', icon: 'homework' },
    { label: 'Apply Leave', path: '/teacher/leaves', icon: 'reports' }
  ];

  return <BaseLayout menuItems={menuItems}>{children}</BaseLayout>;
};

export default TeacherLayout;
