import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { getOngoingExamData } from "../../api/exams";

export default function MonitorExams() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await getOngoingExamData();
        setStudents(res.data.students);
      } catch (error) {
        console.error("Failed to fetch exam data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();

    const interval = setInterval(fetchExamData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
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
        Monitor Ongoing Exam
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Number of Responses</TableCell>
                <TableCell>Time Left</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.responses}</TableCell>
                  <TableCell>{student.timeLeft}</TableCell>
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
        </Paper>
      )}
    </Box>
  );
}
