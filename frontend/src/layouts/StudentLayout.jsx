import React from 'react';
import BaseLayout from './BaseLayout.jsx';

export const StudentLayout = ({ children }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'dashboard' },
    { label: 'My Grades', path: '/student/results', icon: 'exams' },
    { label: 'Attendance logs', path: '/student/attendance', icon: 'attendance' },
    { label: 'Homework', path: '/student/homework', icon: 'homework' },
    { label: 'GPS Bus Tracking', path: '/student/bus-tracking', icon: 'bus-tracking' },
    { label: 'My Profile', path: '/student/profile', icon: 'settings' }
  ];

  return <BaseLayout menuItems={menuItems}>{children}</BaseLayout>;
};

export default StudentLayout;
