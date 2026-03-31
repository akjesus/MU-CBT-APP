import React from "react";
import { getDashboardStats } from "../../api/dashboard";
import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState([]);
  useEffect(() => {
    dashBoardStats();
  }, []);

  const dashBoardStats = async () => {
    try {
      const res = await getDashboardStats();
      if (res.data.success && typeof res.data.data === "object") {
        const data = res.data.data;
        const formattedStats = [
          {
            key: "total_students",
            label: "Total Students",
            value: data.students,
            link: "/admin/students",
          },
          {
            key: "exams",
            label: "Total Exams",
            value: data.total_exams,
            link: "/admin/exams",
          },
          {
            key: "courses",
            label: "Total Courses",
            value: data.courses,
            link: "/admin/schools",
          },
          {
            key: "active_exams",
            label: "Active Exams",
            value: data.active_exams,
            link: "/admin/exams",
          },
          { key: "schools", label: "Schools", value: data.schools },
          { key: "questions", label: "Total Questions", value: data.questions },
        ];
        setStats(formattedStats);
        showSnackbar("Dashboard data fetched successfully", "success");
      } else {
        setStats([]);
        showSnackbar(res.data.message || "Invalid data format", "error");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats([]);
      showSnackbar("Failed to load dashboard stats", "error");
    }
  };
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2C2C78",
            fontSize: { xs: 18, sm: 24 },
          }}
        >
          Admin Dashboard
        </Typography>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {stats.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.key}>
              <Card
                sx={{
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  textAlign: "center",
                  p: 2,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                onClick={() => navigate(item.link || "/")}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", fontSize: { xs: 14, sm: 16 } }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", fontSize: { xs: 20, sm: 24 } }}
                  >
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
