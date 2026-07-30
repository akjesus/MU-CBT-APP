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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  getExamsForCourses,
  getResults,
  deleteResult,
} from "../../api/results";
import { getSessions, getCourses } from "../../api/faculties";
import TablePagination from "@mui/material/TablePagination";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { set } from "react-hook-form";
export default function AdminResults() {
  const userRole = localStorage.getItem("role");
  const [sessions, setSessions] = useState([]);
  const [fetchedCourses, setFetchedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [examDetails, setExamDetails] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [departmentSortOrder, setDepartmentSortOrder] = useState("asc");
  const [openConfirm, setOpenConfirm] = useState({
    open: false,
    data: null,
    message: "Are you sure you want to delete this result?",
  });
  const handleCloseConfirm = () => {
    setOpenConfirm({
      open: false,
      data: null,
      message: "",
    });
  };

  const handleDeleteResult = async (result) => {
    try {
      const res = await deleteResult(result);
      if (res.data.success) {
        showSnackbar("Result deleted successfully!", "success");
        handleFetchResults();
      }
    } catch (error) {
      showSnackbar("There was an error", "error");
      console.error(error);
    }
  };

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
        setFetchedCourses(res.data.courses);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    fetchCourses();
    fetchSessions();
  }, []);

  const handleSessionChange = async (event) => {
    const sessionId = event.target.value;
    setSelectedSession(sessionId);
    setSelectedExam("");
    setCourses([]);
    setResults([]);
    setSelectedCourse("");

    try {
      const res = await getExamsForCourses(sessionId);
      const courseIds = res.data.exams.map((exam) => exam.course_id);
      const filteredCourses = fetchedCourses.filter((course) =>
        courseIds.includes(course.id),
      );
      setCourses(filteredCourses);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const handleCourseChange = async (event) => {
    const courseId = event.target.value;
    setSelectedExam("");
    setResults([]);
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
      if (res.data.results.length === 0) {
        showSnackbar("No results found for this exam", "info");
      }
      setResults(res.data.results);
      setExamDetails(res.data.examDetails);
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
    const csvHeaders = [
      ["Exam Name", "Exam Date", "Exam Hall", "", "", ""],
      [
        examDetails.exam_name,
        new Date(examDetails.exam_date).toLocaleDateString(),
        `Hall${examDetails.exam_hall}`,
        "",
        "",
        "",
      ],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];
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

    const fullCSV =
      csvHeaders.map((row) => row.join(",")).join("\n") + "\n" + csvContent;

    const blob = new Blob([fullCSV], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(
      blob,
      `${(results[0]?.exam_name).replace(/\s+/g, "_")}_hall_${examDetails.exam_hall}_results.csv`,
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Exam Results", 15, 20);
    doc.setFontSize(12);
    doc.text(`Exam Name: ${examDetails.exam_name}`, 15, 30);
    doc.text(
      `Exam Date: ${new Date(examDetails.exam_date).toLocaleDateString()}`,
      15,
      35,
    );
    doc.text(`Exam Hall:  Hall ${examDetails.exam_hall}`, 15, 40);

    const tableData = results.map((result) => [
      `${result.first_name} ${result.last_name}`,
      result.registration_number,
      result.department_name,
      result.level_name,
      result.score,
      result.max_score_obtainable,
    ]);
    autoTable(doc, {
      head: [
        [
          "Student Name",
          "Registration Number",
          "Department",
          "Level",
          "Score",
          "Max Score",
        ],
      ],
      body: tableData,
      startY: 50,
    });

    // Save the PDF
    doc.save(`${examDetails.exam_name.replace(/\s+/g, "_")}_${examDetails.exam_hall.replace(/\s+/g, "_")}_results.pdf`);
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

  const filteredresults = results.filter(
    (r) =>
      r.first_name.toLowerCase().includes(search.toLowerCase()) ||
      r.last_name.toLowerCase().includes(search.toLowerCase()) ||
      r.other_names.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(search.toLowerCase()),
  );

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

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl
          sx={{ minWidth: 220, width: { xs: "60%", sm: 220 } }}
          size="small"
        >
          <InputLabel>Session</InputLabel>
          <Select value={selectedSession} onChange={handleSessionChange}>
            <MenuItem value=""> Select Session</MenuItem>
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{ minWidth: 220, width: { xs: "100%", sm: 220 } }}
          size="small"
        >
          <InputLabel>Course</InputLabel>
          <Select value={selectedCourse} onChange={handleCourseChange}>
            <MenuItem value="">Select Course</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.code} - {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          disabled={!exams.length}
          sx={{ minWidth: 220, width: { xs: "100%", sm: 220 } }}
          size="small"
        >
          <InputLabel>Exams</InputLabel>
          <Select value={selectedExam} onChange={handleExamChange}>
            <MenuItem value="">Select Exams</MenuItem>
            {exams &&
              exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button
          disabled={!selectedExam}
          sx={{
            color: "#fff",
            bgcolor: "#2C2C78",
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 1, sm: 0 },
          }}
          onClick={handleFetchResults}
        >
          Get Results
        </Button>
      </Box>

      <Box sx={{ display: "flex", mb: 2, mt: 0, gap: 2 }}>
        <Button
          disabled={results.length === 0}
          variant="contained"
          sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
          onClick={exportToCSV}
        >
          Export to CSV
        </Button>
        <Button
          disabled={results.length === 0}
          variant="outlined"
          onClick={exportToPDF}
        >
          Export to PDF
        </Button>
        <TextField
          label="Search Results"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
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
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#2C2C78",
                    fontSize: { xs: 14, sm: 18 },
                  }}
                >
                  Department
                </TableCell>
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
              {userRole === "admin" ||
                (userRole === "superadmin" && (
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
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredresults
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((result, index) => (
                <TableRow key={result.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {result.last_name} {result.first_name} {result.other_names}
                  </TableCell>
                  <TableCell>{result.registration_number}</TableCell>
                  <TableCell>{result.department_name}</TableCell>
                  <TableCell>{result.level_name}</TableCell>
                  <TableCell>{result.score}</TableCell>
                  <TableCell>{result.max_score_obtainable}</TableCell>
                  <TableCell>
                    {userRole === "admin" ||
                      (userRole === "superadmin" && (
                        <>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                              setOpenConfirm({
                                ...openConfirm,
                                open: true,
                                data: result,
                              });
                            }}
                            sx={{ ml: 1 }}
                          >
                            Delete
                          </Button>
                        </>
                      ))}
                  </TableCell>
                </TableRow>
              ))}
            {filteredresults.length === 0 && (
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
      <Dialog
        open={openConfirm.open}
        onClose={() => {
          handleCloseConfirm();
        }}
      >
        <DialogTitle>
          <Typography>Confirm Result Delete</Typography>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this result?
            </Typography>
            <DialogActions>
              <Button onClick={() => handleCloseConfirm()}>Cancel</Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDeleteResult(openConfirm.data);
                  handleCloseConfirm();
                }}
              >
                Delete Result
              </Button>
            </DialogActions>
          </DialogContent>
        </DialogTitle>
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
}
