import React, { ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Layout from './components/Layout';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import ClassManager from './components/admin/ClassManager';
import StudentList from './components/admin/StudentList';
import ParentManager from './components/admin/ParentManager';
import AttendanceManager from './components/admin/AttendanceManager';
import BehaviorManager from './components/admin/BehaviorManager';
import AnnouncementManager from './components/admin/AnnouncementManager';
import DocumentManager from './components/admin/DocumentManager';
import TaskManager from './components/admin/TaskManager';
import MessageCenter from './components/admin/MessageCenter';
import QuestionBank from './components/admin/QuestionBank';
import Reports from './components/admin/Reports';

// App (Parent/Student) Components
import AppHome from './components/app/AppHome';
import AttendanceHistory from './components/app/AttendanceHistory';
import BehaviorHistory from './components/app/BehaviorHistory';
import AnnouncementList from './components/app/AnnouncementList';
import DocumentList from './components/app/DocumentList';
import TaskList from './components/app/TaskList';
import MessageCenterApp from './components/app/MessageCenterApp';
import SpeedGame from './components/app/SpeedGame';

const ProtectedRoute = ({ children, requiredRole }: { children?: ReactNode, requiredRole?: 'admin' | 'app' }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to their allowed area if they try to access restricted area
        return <Navigate to={user?.role === 'admin' ? '/admin' : '/app'} replace />;
    }
    return <>{children}</>;
};

const AdminRoutes = () => (
  <Layout role="admin">
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/classes" element={<ClassManager />} />
      <Route path="/announcements" element={<AnnouncementManager />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/tasks" element={<TaskManager />} />
      <Route path="/documents" element={<DocumentManager />} />
      <Route path="/students" element={<StudentList />} />
      <Route path="/parents" element={<ParentManager />} />
      <Route path="/attendance" element={<AttendanceManager />} />
      <Route path="/behavior" element={<BehaviorManager />} />
      <Route path="/questions" element={<QuestionBank />} />
      <Route path="/messages" element={<MessageCenter />} />
    </Routes>
  </Layout>
);

const AppRoutes = () => (
  <Layout role="app">
    <Routes>
      <Route path="/" element={<AppHome />} />
      <Route path="/announcements" element={<AnnouncementList />} />
      <Route path="/tasks" element={<TaskList />} />
      <Route path="/documents" element={<DocumentList />} />
      <Route path="/attendance" element={<AttendanceHistory />} />
      <Route path="/behavior" element={<BehaviorHistory />} />
      <Route path="/game" element={<SpeedGame />} />
      <Route path="/schedule" element={<div className="p-4">Thời khóa biểu</div>} />
      <Route path="/messages" element={<MessageCenterApp />} />
    </Routes>
  </Layout>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminRoutes />
                </ProtectedRoute>
            } />
            
            <Route path="/app/*" element={
                <ProtectedRoute requiredRole="app">
                    <AppRoutes />
                </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        </Router>
    </AuthProvider>
  );
};

export default App;