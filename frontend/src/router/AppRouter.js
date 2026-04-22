import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";

// Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminStudents from "../pages/Admin/Students";
import AdminExams from "../pages/Admin/Exams";
import AdminSchools from "../pages/Admin/Schools";
import StaffSettings from "../pages/Admin/Staff";
import AdminLayout from "../components/AdminLayout"
import AdminResults from "../pages/Admin/Results";

// Student Pages
import StudentDashboard from "../pages/Student/Dashboard";
import StudentExam from "../pages/Student/StudentExam";
import StudentLayout from "../components/StudentLayout";


const AppRouter = () => {
  return (
  <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes (protected + wrapped in AdminLayout) */}
        <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "superadmin", "staff"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route path="staff" element={<StaffSettings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "superadmin", "staff"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="schools" element={<AdminSchools />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="staff" element={<StaffSettings />} />
      </Route>

      {/* Student Routes (protected + wrapped in StudentLayout) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Student Exam Route (protected but no layout - fullscreen mode) */}
      <Route
        path="/student/exam/:exam_id"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentExam />
          </ProtectedRoute>
        }
      />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
}
export default AppRouter;
