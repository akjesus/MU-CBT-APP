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

// Student Pages
import StudentDashboard from "../pages/Student/Dashboard";
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
          <ProtectedRoute roles={["admin", "superadmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route path="staff" element={<StaffSettings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="schools" element={<AdminSchools />} />
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
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
}
export default AppRouter;
