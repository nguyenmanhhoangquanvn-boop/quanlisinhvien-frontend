import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import ClassList from './pages/ClassList';
import Schedule from './pages/Schedule';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import DepartmentList from './pages/DepartmentList';
import Statistics from './pages/Statistics';
import LecturerManagement from './pages/LecturerManagement';
import GradeManagement from './pages/GradeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import MyAttendance from './pages/MyAttendance';
import MyProfile from './pages/MyProfile';
import MySchedule from './pages/MySchedule';
import MyGrades from './pages/MyGrades';

const ADMIN = ['ROLE_ADMIN'];
const USER  = ['ROLE_USER'];
const ALL   = ['ROLE_ADMIN', 'ROLE_USER'];

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Cả ADMIN và USER */}
        <Route path="/" element={
          <PrivateRoute roles={ALL}><MainLayout><Dashboard /></MainLayout></PrivateRoute>
        } />
        <Route path="/schedule" element={
  <PrivateRoute roles={ADMIN}><MainLayout><Schedule /></MainLayout></PrivateRoute>
} />

        {/* Chỉ ADMIN */}
        <Route path="/classes" element={
          <PrivateRoute roles={ADMIN}><MainLayout><ClassList /></MainLayout></PrivateRoute>
        } />
        <Route path="/students" element={
          <PrivateRoute roles={ADMIN}><MainLayout><StudentList /></MainLayout></PrivateRoute>
        } />
        <Route path="/students/:id" element={
          <PrivateRoute roles={ADMIN}><MainLayout><StudentDetail /></MainLayout></PrivateRoute>
        } />
        <Route path="/departments" element={
          <PrivateRoute roles={ADMIN}><MainLayout><DepartmentList /></MainLayout></PrivateRoute>
        } />
        <Route path="/statistics" element={
          <PrivateRoute roles={ADMIN}><MainLayout><Statistics /></MainLayout></PrivateRoute>
        } />
        <Route path="/lecturers" element={
          <PrivateRoute roles={ADMIN}><MainLayout><LecturerManagement /></MainLayout></PrivateRoute>
        } />
        <Route path="/grades" element={
          <PrivateRoute roles={ADMIN}><MainLayout><GradeManagement /></MainLayout></PrivateRoute>
        } />
        <Route path="/attendance" element={
          <PrivateRoute roles={ADMIN}><MainLayout><AttendanceManagement /></MainLayout></PrivateRoute>
        } />

        {/* Chỉ USER */}
        <Route path="/my-profile" element={
          <PrivateRoute roles={USER}><MainLayout><MyProfile /></MainLayout></PrivateRoute>
        } />
        <Route path="/my-schedule" element={
          <PrivateRoute roles={USER}><MainLayout><MySchedule /></MainLayout></PrivateRoute>
        } />
        <Route path="/my-grades" element={
          <PrivateRoute roles={USER}><MainLayout><MyGrades /></MainLayout></PrivateRoute>
        } />
        <Route path="/my-attendance" element={
  <PrivateRoute roles={USER}><MainLayout><MyAttendance /></MainLayout></PrivateRoute>
} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;