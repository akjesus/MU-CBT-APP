import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
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
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  School,
  Assignment,
  Timer,
  CheckCircle,
  PlayArrow,
} from "@mui/icons-material";

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
    instructions: "",
  });
  const [openExamResultModal, setOpenExamResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const keyToDelete = Object.keys(localStorage).find((key) =>
    key.startsWith("exam"),
  );

  if (keyToDelete) {
    console.log("Deleting localStorage key:", keyToDelete);
    localStorage.removeItem(keyToDelete);
  }

  const handleTakeExamClick = (exam_id, instruction) => {
    setConfirmDialog({ open: true, exam_id, instruction });
  };

  const handleConfirmTakeExam = () => {
    navigate(`/student/exam/${confirmDialog.exam_id}`);
    setConfirmDialog({ open: false, exam_id: null, instruction: "" });
  };

  const handleCancelTakeExam = () => {
    setConfirmDialog({ open: false, exam_id: null, instruction: "" });
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
    <>
      <Box>
        {/* HERO */}
        <Card
          sx={{
            mb: 1,
            borderRadius: 5,
            background: "linear-gradient(135deg,#03a449 0%, #03a449 100%)",
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.8rem", md: "2.5rem" },
              }}
            >
              Welcome Back
            </Typography>

            <Typography sx={{ opacity: 0.9, mt: 1, fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
              {userDetails.last_name} {userDetails.first_name}{" "}
              {userDetails.other_names}
            </Typography>

            <Typography color="text.secondary">
              {" "}
              You have {eligibleExams.length} Available Exam(s)
            </Typography>
          </CardContent>
        </Card>

        {/* PROFILE */}
        <Card
          sx={{
            borderRadius: 5,
            mb: 1,
            boxShadow: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2} color="#2C2C78">
              Student Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography mt={1}>
                  <strong>Email:</strong> {userDetails.email || "N/A"}
                </Typography>

                <Typography mt={1}>
                  <strong>Matric No:</strong>{" "}
                  {userDetails.matriculation_number || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>Department:</strong> {userDetails.department || "N/A"}
                </Typography>

                <Typography mt={1}>
                  <strong>Level:</strong> {userDetails.level || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {eligibleExams.length > 0 ? (
          <>
            <Typography variant="h5" fontWeight={700} mb={2} color="#2C2C78">
              Available Examinations
            </Typography>
            <Grid container spacing={3}>
              {eligibleExams.map((exam, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card
                    sx={{
                      borderRadius: 5,
                      height: "100%",
                      transition: ".3s",
                      boxShadow: 3,

                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {exam.exam_name}
                      </Typography>

                      <Typography
                        variant="body1"
                        color="success"
                        fontWeight={600}
                      >
                        {exam.course_name}
                      </Typography>

                      <Box mt={1}>
                        <Typography variant="body2">
                          📅{" "}
                          {moment(exam.exam_date).format("DD MMM YYYY") ||
                            "N/A"}
                        </Typography>

                        <Typography variant="body2">
                          ⏰{" "}
                          {moment(exam.start_time, "HH:mm").format("hh:mm A") ||
                            "N/A"}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrow />}
                        sx={{
                          mt: 3,
                          borderRadius: 3,
                        }}
                        onClick={() => {
                          handleTakeExamClick(exam.exam_id, exam.instruction);
                        }}
                      >
                        Start Exam
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Card
            sx={{
              borderRadius: 4,
              textAlign: "center",
              p: 4,
            }}
          >
            <Typography color="text.secondary">
              No eligible examinations available.
            </Typography>
          </Card>
        )}

        {/* RESULT POPUP */}
        <Dialog
          open={openExamResultModal}
          onClose={() => setOpenExamResultModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              Exam Successfully Submitted
            </Box>
          </DialogTitle>

          <DialogContent>
            <Typography>
              <strong>Exam:</strong> {examResult?.examName}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              <strong>Course:</strong> {examResult?.courseName}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                color: "text.secondary",
              }}
            >
              Submitted at:{" "}
              {examResult?.timestamp
                ? new Date(examResult.timestamp).toLocaleString()
                : ""}
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={() => setOpenExamResultModal(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* START EXAM CONFIRMATION */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelTakeExam}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: "red" }}>
            Read Examination Instructions Carefully
          </DialogTitle>

          <DialogContent sx={{ p: 3, maxHeight: 380, overflowY: "auto" }}>
            <Typography sx={{ maxHeight: 380, mt: 4 }}>
              {confirmDialog.instruction || "No instructions provided."}
            </Typography>
            <br></br>
            <DialogContentText sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              Are you ready to start this examination?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCancelTakeExam}
              color="success"
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmTakeExam}
            >
              Start Exam
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentDashboard;
