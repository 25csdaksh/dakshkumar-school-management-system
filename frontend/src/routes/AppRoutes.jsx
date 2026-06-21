import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.jsx';

// Layouts
import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import ParentLayout from '../layouts/ParentLayout.jsx';

// Pages
import Login from '../pages/auth/Login.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminStudents from '../pages/admin/Students.jsx';
import AdminTeachers from '../pages/admin/Teachers.jsx';
import AdminClasses from '../pages/admin/Classes.jsx';
import AdminAttendance from '../pages/admin/Attendance.jsx';
import AdminFees from '../pages/admin/Fees.jsx';
import AdminExams from '../pages/admin/Exams.jsx';
import AdminResults from '../pages/admin/Results.jsx';
import AdminHomework from '../pages/admin/Homework.jsx';
import AdminNotices from '../pages/admin/Notices.jsx';
import AdminReports from '../pages/admin/Reports.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';
import AdminLibrary from '../pages/admin/Library.jsx';
import AdminHostel from '../pages/admin/Hostel.jsx';
import AdminInventory from '../pages/admin/Inventory.jsx';
import BusTracking from '../pages/admin/BusTracking.jsx';
import AdminAcademic from '../pages/admin/Academic.jsx';
import AdminTimetable from '../pages/admin/TimetableGenerator.jsx';
import AdminLeaves from '../pages/admin/Leaves.jsx';
import AdminTransport from '../pages/admin/Transport.jsx';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import TeacherAttendance from '../pages/teacher/Attendance.jsx';
import TeacherMarks from '../pages/teacher/Marks.jsx';
import TeacherHomework from '../pages/teacher/Homework.jsx';
import TeacherLeaves from '../pages/teacher/Leaves.jsx';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard.jsx';
import StudentResults from '../pages/student/Results.jsx';
import StudentAttendance from '../pages/student/Attendance.jsx';
import StudentHomework from '../pages/student/Homework.jsx';

// Parent Pages
import ParentDashboard from '../pages/parent/Dashboard.jsx';
import ParentResults from '../pages/parent/Results.jsx';
import ParentAttendance from '../pages/parent/Attendance.jsx';
import ParentFees from '../pages/parent/Fees.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Protected Routes */}
      <Route path="/admin/*" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="academic" element={<AdminAcademic />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="homework" element={<AdminHomework />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="library" element={<AdminLibrary />} />
              <Route path="hostel" element={<AdminHostel />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="transport" element={<AdminTransport />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="bus-tracking" element={<BusTracking />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </PrivateRoute>
      } />

      {/* Teacher Protected Routes */}
      <Route path="/teacher/*" element={
        <PrivateRoute allowedRoles={['teacher']}>
          <TeacherLayout>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="marks" element={<TeacherMarks />} />
              <Route path="homework" element={<TeacherHomework />} />
              <Route path="leaves" element={<TeacherLeaves />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </TeacherLayout>
        </PrivateRoute>
      } />

      {/* Student Protected Routes */}
      <Route path="/student/*" element={
        <PrivateRoute allowedRoles={['student']}>
          <StudentLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="homework" element={<StudentHomework />} />
              <Route path="bus-tracking" element={<BusTracking />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </StudentLayout>
        </PrivateRoute>
      } />

      {/* Parent Protected Routes */}
      <Route path="/parent/*" element={
        <PrivateRoute allowedRoles={['parent']}>
          <ParentLayout>
            <Routes>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="results" element={<ParentResults />} />
              <Route path="attendance" element={<ParentAttendance />} />
              <Route path="fees" element={<ParentFees />} />
              <Route path="bus-tracking" element={<BusTracking />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ParentLayout>
        </PrivateRoute>
      } />

      {/* Catch-all fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
