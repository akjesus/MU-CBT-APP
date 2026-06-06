import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboard";
import { useNavigate } from "react-router-dom";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
  Avatar,
  Stack,
  Button,
} from "@mui/material";

import {
  People,
  School,
  Quiz,
  MenuBook,
  FactCheck,
  AccountBalance,
} from "@mui/icons-material";

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
            key: "questions",
            label: "Total Questions",
            value: data.questions,
            link: "/admin/exams",
          },
          {
            key: "courses",
            label: "Total Courses",
            value: data.courses,
            link: "/admin/faculties",
          },
          {
            key: "active_exams",
            label: "Active Exams",
            value: data.active_exams,
            link: "/admin/exams",
          },
          {
            key: "faculties",
            label: "Faculties",
            value: data.faculties,
            link: "/admin/faculties",
          },
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

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(135deg, #2C2C78 0%, #4F46E5 100%)",
            color: "#fff",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}
          >
            CBT Admin Dashboard
          </Typography>

          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Manage examinations, students, courses and staff from one place.
          </Typography>
        </Box>

        {/* STATS */}
        <Grid container spacing={6}>
          {stats.map((item) => {
            const icons = {
              total_students: <People />,
              exams: <Quiz />,
              courses: <MenuBook />,
              active_exams: <FactCheck />,
              faculties: <AccountBalance />,
              questions: <School />,
            };

            const gradients = {
              total_students: "linear-gradient(135deg,#3B82F6,#2563EB)",
              exams: "linear-gradient(135deg,#10B981,#059669)",
              courses: "linear-gradient(135deg,#F59E0B,#D97706)",
              active_exams: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
              faculties: "linear-gradient(135deg,#EC4899,#BE185D)",
              questions: "linear-gradient(135deg,#06B6D4,#0891B2)",
            };

            return (
              <Grid item xs={12} sm={6} lg={4} key={item.key}>
                <Card
                  onClick={() => navigate(item.link)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    transition: "all .3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      color: "#fff",
                      background: gradients[item.key],
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="body2">{item.label}</Typography>

                        <Typography variant="h3" fontWeight={700} mt={1}>
                          {item.value}
                        </Typography>
                      </Box>

                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 56,
                          height: 56,
                        }}
                      >
                        {icons[item.key]}
                      </Avatar>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
}
