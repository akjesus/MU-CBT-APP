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
  IconButton,
  Select,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Add, FileUpload, Edit, Delete, CheckBox } from "@mui/icons-material";
import { getQuestions, deleteResult } from "../../api/results";
import { getCourses } from "../../api/faculties";
import TablePagination from "@mui/material/TablePagination";

export default function AdminQuestions() {
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
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
  const [userRole, setUserRole] = useState("");
  const [openConfirm, setOpenConfirm] = useState({
    open: false,
    data: null,
    message: "Are you sure you want to delete this question?",
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
      const res = await deleteResult(result.id);
      if (res.data.success) {
        showSnackbar("Result deleted successfully!", "success");
        handleFetchQuestions();
      }
    } catch (error) {
      showSnackbar("There was an error", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await getCourses();
        setCourses(res.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    getData();
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

  const handleCourseChange = async (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleFetchQuestions = async () => {
    try {
      const res = await getQuestions(selectedCourse);
      setQuestions(res.data.questions || []);
      console.log(res);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        Manage Questions
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
          sx={{ minWidth: 300, width: { xs: "100%", sm: 220 } }}
          size="small"
        >
          <InputLabel>Course</InputLabel>
          <Select value={selectedCourse} onChange={handleCourseChange}>
            <MenuItem value="">Select Course</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          disabled={!selectedCourse}
          sx={{
            color: "#fff",
            bgcolor: "#2C2C78",
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 1, sm: 0 },
          }}
          onClick={handleFetchQuestions}
        >
          Get Questions
        </Button>

        <Button startIcon={<Add />} variant="contained" color="primary">
          Add Question
        </Button>
        <Button startIcon={<FileUpload />} variant="outlined">
          Import Questions
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
                Type
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
                  Text
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
                Score Obtainable
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
            {questions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((q, index) => (
                <TableRow key={q.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{q.question_type}</TableCell>
                  <TableCell>{q.text}</TableCell>
                  <TableCell>{q.level}</TableCell>
                  <TableCell>{q.score_obtainable}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      minWidth: 90,
                      maxWidth: 120,
                      p: { xs: 0.5, sm: 1 },
                      overflow: "hidden",
                    }}
                  >
                    {userRole === "admin" ||
                      (userRole === "superadmin" && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#e3e3fa",
                              borderRadius: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#d1d1f7" },
                            }}
                            aria-label="Edit Question"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            aria-label="Delete Question"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            aria-label="Delete Question"
                          >
                            <CheckBox fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                  </TableCell>
                </TableRow>
              ))}
            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No questions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={questions.length}
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
