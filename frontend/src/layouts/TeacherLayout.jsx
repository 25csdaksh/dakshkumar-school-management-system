import React from 'react';
import BaseLayout from './BaseLayout.jsx';

export const TeacherLayout = ({ children }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Attendance logs', path: '/teacher/attendance', icon: 'attendance' },
    { label: 'Exam Grades', path: '/teacher/marks', icon: 'exams' },
    { label: 'Homework Logs', path: '/teacher/homework', icon: 'homework' },
    { label: 'Exam Schedules', path: '/teacher/exams', icon: 'exams' },
    { label: 'Apply Leave', path: '/teacher/leaves', icon: 'reports' },
    { label: 'My Profile', path: '/teacher/profile', icon: 'settings' }
  ];

  return <BaseLayout menuItems={menuItems}>{children}</BaseLayout>;
};

export default TeacherLayout;
