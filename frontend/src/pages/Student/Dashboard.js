import React from "react";
import { useEffect, useState, useCallback } from "react";
import { getEligibleExams } from "../../api/exams";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";

const StudentDashboard = () => {
  const [eligibleExams, setEigibleExams] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchEligibleExams = useCallback(async () => {
    try {
      const res = await getEligibleExams();
      if (res.data.exams) {
        showSnackbar("Eligible Exams fetched", "success");
        setEigibleExams(res.data.exams);
      } else {
        showSnackbar("No eligible exams found", "info");
        setEigibleExams([]);
      }
    } catch (error) {
      console.error("Error fetching eligible exams:", error);
      showSnackbar("Failed to fetch eligible exams", "error");
    }
  }, []);

  useEffect(() => {
    fetchEligibleExams();
    const user = JSON.parse(localStorage.getItem("user"));
    setUserDetails(user);
  }, [fetchEligibleExams]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#2C2C78",
          fontSize: { xs: 18, sm: 24 },
        }}
      >
        Student Details
      </Typography>
      <Box sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="body1">
          Name: {userDetails.first_name } {userDetails.last_name}
        </Typography>
        <Typography variant="body1">
          Email: {userDetails?.email || "N/A"}
        </Typography>
        <Typography variant="body1">
          Department: {userDetails?.department || "N/A"}
        </Typography>
        <Typography variant="body1">
          Level: {userDetails?.level || "N/A"}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "#2C2C78" }}
        >
          Eligible Exams
        </Typography>
        {eligibleExams.length > 0 ? (
          <Grid container spacing={2}>
            {eligibleExams.map((exam, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {exam.name}
                    </Typography>
                    <Typography variant="body2">
                      Date: {exam.date || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      Venue: {exam.venue || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No eligible exams available.
          </Typography>
        )}
      </Box>

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
    </Box>
  );
};

export default StudentDashboard;
