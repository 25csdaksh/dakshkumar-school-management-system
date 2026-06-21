import React from 'react';
import BaseLayout from './BaseLayout.jsx';

export const AdminLayout = ({ children }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Student Management', path: '/admin/students', icon: 'students' },
    { label: 'Teacher Management', path: '/admin/teachers', icon: 'teachers' },
    { label: 'Class Management', path: '/admin/classes', icon: 'classes' },
    { label: 'Academic Setup', path: '/admin/academic', icon: 'classes' },
    { label: 'Timetable Planner', path: '/admin/timetable', icon: 'attendance' },
    { label: 'Attendance logs', path: '/admin/attendance', icon: 'attendance' },
    { label: 'Fees Management', path: '/admin/fees', icon: 'fees' },
    { label: 'Examination', path: '/admin/exams', icon: 'exams' },
    { label: 'Result Management', path: '/admin/results', icon: 'exams' },
    { label: 'Homework logs', path: '/admin/homework', icon: 'homework' },
    { label: 'Notice Board', path: '/admin/notices', icon: 'notices' },
    { label: 'Inventory Management', path: '/admin/inventory', icon: 'inventory' },
    { label: 'Transport & Fleet', path: '/admin/transport', icon: 'bus-tracking' },
    { label: 'Staff Leave Review', path: '/admin/leaves', icon: 'reports' },
    { label: 'Reports', path: '/admin/reports', icon: 'reports' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' }
  ];

  return <BaseLayout menuItems={menuItems}>{children}</BaseLayout>;
};

export default AdminLayout;
