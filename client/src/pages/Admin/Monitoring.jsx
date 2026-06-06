import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { getActiveExams, getStudentsForExam, endExam } from "../../api/exams";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Tab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

const Monitoring = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [confirmEndDialog, setConfirmEndDialog] = useState({
    open: false,
    exam: null,
  });
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

  const countdownIntervalRef = useRef(null);
  const refetchIntervalRef = useRef(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getActiveExams();
        setExams(response.data.exams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            time_left:
              student.status === "submitted"
                ? student.time_left
                : student.time_left > 0
                  ? student.time_left - 1
                  : 0,
          })),
        );
      }, 1000);

      // Start refetch interval every 2 minutes
      refetchIntervalRef.current = setInterval(async () => {
        try {
          const response = await getStudentsForExam(selectedExam.id);
          if (response.data.success) {
            setStudents(response.data.students);
          }
        } catch (error) {
          console.error("Error refetching students:", error);
        }
      }, 15000); //15 seconds
    } else {
      // Clear intervals when no exam is selected
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
        refetchIntervalRef.current = null;
      }
    }

    // Cleanup on unmount or exam change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [selectedExam]);

  const handleExamSelect = async (exam) => {
    if (selectedExam && selectedExam.id === exam.id) {
      setSelectedExam(null);
      setStudents([]);
      setExamDetails(null);
      return;
    }

    setSelectedExam(exam);
    try {
      const response = await getStudentsForExam(exam.id);
      if (response.status === 204) {
        showSnackbar("No students logged in for this exam", "info");
        return;
      }
      if (!response.data.success) {
        setStudents([]);
        return;
      }
      showSnackbar("Logged in Students fetched successfully", "success");
      setStudents(response.data.students);
      setExamDetails(exam || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setExamDetails([]);
    }
  };

  const handleEndExam = async (exam) => {
    try {
      await endExam(exam.id);
      showSnackbar("Exam ended successfully", "success");
      const examsResponse = await getActiveExams();
      setExams(examsResponse.data.exams);

    } catch (error) {
      console.error("Error ending exam:", error);
      showSnackbar("Error ending exam", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "secondary";
      case "in_progress":
        return "success";
      default:
        return "default";
    }
  };
  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  return (
    <div>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#2C2C78",
          fontSize: { xs: 18, sm: 24 },
        }}
      >
        Monitor Ongoing Exams
      </Typography>

      <Typography variant="h6">Active Exams</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900 }}>S/No</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Exam Name</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 900 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams &&
              exams.map((ex, idx) => (
                <TableRow key={ex.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{ex.course_code}</TableCell>
                  <TableCell>
                    {moment(ex.start_time, "HH:mm:ss").format("hh:mm A")}
                  </TableCell>
                  <TableCell>{ex.duration} Minutes</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{ marginRight: 1 }}
                      onClick={() => handleExamSelect(ex)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        setConfirmEndDialog({
                          ...confirmEndDialog,
                          open: true,
                          exam: ex,
                        })
                      }
                    >
                      End Exam
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      {selectedExam && examDetails && (
        <Box>
          <Typography variant="h6" sx={{ marginTop: 4 }}>
            Active Students
          </Typography>
          <Table sx={{ marginTop: 2 }} component={Paper}>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Time Left</TableCell>
                <TableCell>Answered</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.registration_number}</TableCell>
                  <TableCell>{formatTime(student.time_left)}</TableCell>
                  <TableCell>
                    {student.responses_count }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getStatusColor(student.status)}
                      size="small"
                    >
                      {student.status}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No students logged in
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
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
      <Dialog
        open={confirmEndDialog.open}
        onClose={() =>
          setConfirmEndDialog({ ...confirmEndDialog, open: false })
        }
      >
        <DialogTitle>End Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end the exam "
            {confirmEndDialog.exam?.course_code}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() =>
              setConfirmEndDialog({ ...confirmEndDialog, open: false })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleEndExam(confirmEndDialog.exam);
              setConfirmEndDialog({ ...confirmEndDialog, open: false });
            }}
            color="error"
            variant="contained"
          >
            End Exam
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Monitoring;
