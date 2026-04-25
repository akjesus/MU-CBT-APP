import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { getActiveExams, getStudentsForExam } from "../../api/exams";
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
} from "@mui/material";
import axios from "axios";

const Monitoring = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [examDetails, setExamDetails] = useState(null);

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
            time_left: student.time_left > 0 ? student.time_left - 1 : 0,
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
      }, 120000);
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
      if (!response.data.success) {
        setStudents([]);
        return;
      }
      setStudents(response.data.students);
      setExamDetails(exam || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setExamDetails([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "error";
      case "in_progress":
        return "success";
      case "completed":
        return "primary";
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
              <TableCell>S/No</TableCell>
              <TableCell>Exam Name</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
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
                      onClick={() => handleExamSelect(ex)}
                    >
                      View Details
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
                    {Object.values(student.responses).length}
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
            </TableBody>
          </Table>
        </Box>
      )}
    </div>
  );
};

export default Monitoring;
