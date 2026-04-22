import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEligibleExams } from "../../api/exams";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [eligibleExams, setEigibleExams] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    exam_id: null,
  });
  const [openExamResultModal, setOpenExamResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTakeExamClick = (exam_id) => {
    setConfirmDialog({ open: true, exam_id });
  };

  const handleConfirmTakeExam = () => {
    navigate(`/student/exam/${confirmDialog.exam_id}`);
    setConfirmDialog({ open: false, exam_id: null });
  };

  const handleCancelTakeExam = () => {
    setConfirmDialog({ open: false, exam_id: null });
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
    // Check for exam result from auto-submission
    const savedResult = localStorage.getItem("examResult");
    if (savedResult) {
      const result = JSON.parse(savedResult);
      setExamResult(result);
      setOpenExamResultModal(true);
      localStorage.removeItem("examResult");
    }
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
          Name: {userDetails.first_name} {userDetails.last_name}
        </Typography>
        <Typography variant="body1">
          Email: {userDetails?.email || "N/A"}
        </Typography>
        <Typography variant="body1">
          Matriculation Number: {userDetails?.matriculation_number || "N/A"}
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
                <Card
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {exam.exam_name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {exam.course_name}
                    </Typography>
                    <Typography variant="body2">
                      Date: {exam.exam_date || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      Start Time: {exam.start_time || "N/A"}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ m: 2 }}
                    onClick={() => handleTakeExamClick(exam.exam_id)}
                  >
                    Take Exam
                  </Button>
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

      <Dialog open={confirmDialog.open} onClose={handleCancelTakeExam}>
        <DialogTitle>Take Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to start this exam? Once started, you cannot
            go back.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTakeExam}>Cancel</Button>
          <Button
            onClick={handleConfirmTakeExam}
            variant="contained"
            color="primary"
          >
            Start Exam
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openExamResultModal}
        onClose={() => setOpenExamResultModal(false)}
      >
        <DialogTitle sx={{ color: "#4caf50", fontWeight: "bold" }}>
          Exam Submitted
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Exam:</strong> {examResult?.examName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Course:</strong> {examResult?.courseName}
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 2, color: "#1976d2", fontWeight: "bold" }}
            ></Typography>
            <Typography variant="body2" sx={{ mt: 2, color: "#999" }}>
              Submitted at: {new Date(examResult?.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenExamResultModal(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
