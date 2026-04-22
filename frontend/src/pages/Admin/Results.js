import React, { useEffect, useState } from "react";
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { getExamsForCourses, getResults } from "../../api/results";
import { getSessions, getCourses } from "../../api/schools";
import TablePagination from "@mui/material/TablePagination";
import { saveAs } from "file-saver";

export default function AdminResults() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [departmentSortOrder, setDepartmentSortOrder] = useState("asc");
  const [userRole, setUserRole] = useState("viewer"); // Default role

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getSessions();
        setSessions(res.data.sessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
    };
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(res.data.courses);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    fetchCourses();
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const role = localStorage.getItem("role");
        setUserRole(role);
      } catch (error) {
        console.error("Failed to fetch user role", error);
      }
    };
    fetchUserRole();
  }, []);

  const handleSessionChange = async (event) => {
    const sessionId = event.target.value;
    setSelectedSession(sessionId);
    setExams([]);

    try {
      const res = await getExamsForCourses(sessionId);
      const courseIds = res.data.exams.map((exam) => exam.course_id);
      const filteredCourses = courses.filter((course) =>
        courseIds.includes(course.id),
      );
      setCourses(filteredCourses);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const handleCourseChange = async (event) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);
    try {
      const res = await getExamsForCourses(selectedSession, courseId);
      setExams(res.data.exams);
    } catch (error) {
      console.error("Failed to fetch exams", error);
    }
  };

  const handleFetchResults = async () => {
    try {
      const res = await getResults(selectedExam);
      setResults(res.data.results);
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleExamChange = (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const exportToCSV = () => {
    const csvContent = [
      [
        "Student Name",
        "Registration Number",
        "Department",
        "Level",
        "Score",
        "Max Score",
      ],
      ...results.map((result) => [
        `${result.first_name} ${result.last_name}`,
        result.registration_number,
        result.department_name,
        result.level_name,
        result.score,
        result.max_score_obtainable,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${(results[0]?.exam_name).replace(/\s+/g, "_")}_results.csv`);
  };
  const handleDepartmentSort = (event, newOrder) => {
    if (newOrder) {
      setDepartmentSortOrder(newOrder);
      const sortedResults = [...results].sort((a, b) => {
        if (newOrder === "asc") {
          return a.department_name.localeCompare(b.department_name);
        } else {
          return b.department_name.localeCompare(a.department_name);
        }
      });
      setResults(sortedResults);
    }
  };

  const handleDeleteResult = (resultId) => {
    console.log(`Deleting result: ${resultId}`);
  };
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
        View Results
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Session</InputLabel>
          <Select value={selectedSession} onChange={handleSessionChange}>
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Course</InputLabel>
          <Select value={selectedCourse} onChange={handleCourseChange}>
            {courses &&
              courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Exams</InputLabel>
          <Select value={selectedExam} onChange={handleExamChange}>
            {exams &&
              exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
          onClick={handleFetchResults}
        >
          Load Results
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
          onClick={exportToCSV}
        >
          Export to CSV
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                S/N
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                Student Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                Registration Number
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                <ToggleButtonGroup
                  value={departmentSortOrder}
                  exclusive
                  onChange={handleDepartmentSort}
                  aria-label="department sort order"
                  size="small"
                >
                  <ToggleButton value="asc" aria-label="sort ascending">
                    Asc
                  </ToggleButton>
                  <ToggleButton value="desc" aria-label="sort descending">
                    Desc
                  </ToggleButton>
                </ToggleButtonGroup>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                Level
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                Score
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#2C2C78",
                  fontSize: { xs: 14, sm: 18 },
                }}
              >
                Max Score
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#2C2C78",
                    fontSize: { xs: 14, sm: 18 },
                  }}
                >
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((result, index) => (
                <TableRow key={result.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {result.first_name} {result.last_name}
                  </TableCell>
                  <TableCell>{result.registration_number}</TableCell>
                  <TableCell>{result.department_name}</TableCell>
                  <TableCell>{result.level_name}</TableCell>
                  <TableCell>{result.score}</TableCell>
                  <TableCell>{result.max_score_obtainable}</TableCell>
                  <TableCell>
                    {userRole === "admin" ? (
                      <>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleDeleteResult(result.id)}
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No Actions Available
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

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
}
