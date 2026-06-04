import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import EditProfile from "./pages/mentor/EditProfile";
import BrowseMentors from "./pages/student/BrowseMentors";
import MentorProfile from "./pages/student/MentorProfile";
import BookSession from "./pages/student/BookSession";
import PaymentPage from "./pages/student/PaymentPage";
import SessionRoom from "./pages/student/SessionRoom";
import AISummaryPage from "./pages/student/AISummaryPage";
import MentorSessionRoom from "./pages/mentor/MentorSessionRoom";
import ManageDisputes from "./pages/admin/ManageDisputes";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected routes */}
          {/* STUDENT */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/browse"
            element={
              <ProtectedRoute allowedRole="student">
                <BrowseMentors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/mentor/:mentorId"
            element={
              <ProtectedRoute allowedRole="student">
                <MentorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/book/:mentorId"
            element={
              <ProtectedRoute allowedRole="student">
                <BookSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payment/:sessionId"
            element={
              <ProtectedRoute allowedRole="student">
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/session/:sessionId"
            element={
              <ProtectedRoute allowedRole="student">
                <SessionRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/summary/:sessionId"
            element={
              <ProtectedRoute allowedRole="student">
                <AISummaryPage />
              </ProtectedRoute>
            }
          />
          {/* MENTOR */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/profile/edit"
            element={
              <ProtectedRoute allowedRole="mentor">
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/session/:sessionId"
            element={
              <ProtectedRoute allowedRole="mentor">
                <MentorSessionRoom />
              </ProtectedRoute>
            }
          />
          {/* ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageDisputes />
              </ProtectedRoute>
            }
          />
          4.
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
