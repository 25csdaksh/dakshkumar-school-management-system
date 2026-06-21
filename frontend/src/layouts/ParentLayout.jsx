import React from 'react';
import BaseLayout from './BaseLayout.jsx';

export const ParentLayout = ({ children }) => {
  const menuItems = [
    { label: 'Children Panel', path: '/parent/dashboard', icon: 'dashboard' },
    { label: 'Report Cards', path: '/parent/results', icon: 'exams' },
    { label: 'Attendance logs', path: '/parent/attendance', icon: 'attendance' },
    { label: 'Billing / Fees', path: '/parent/fees', icon: 'fees' },
    { label: 'GPS Bus Tracking', path: '/parent/bus-tracking', icon: 'bus-tracking' }
  ];

  return <BaseLayout menuItems={menuItems}>{children}</BaseLayout>;
};

export default ParentLayout;
