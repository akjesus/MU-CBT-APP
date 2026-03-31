import React, { useState, useCallback } from "react";
import { useEffect } from "react";
import { getCourses, getSessions } from "../../api/schools";
import { getDepartments } from "../../api/departments";
import {
  getAllExams,
  updateExam,
  createExam,
  deleteExam,
  toggleExamActive,
  getQuestionsForExam,
  addQuestionsToExam,
  deleteQuestion,
} from "../../api/exams";

import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  TablePagination,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newExam, setNewExam] = useState({
    department_id: [],
    semester: "",
    level: "",
    course_id: "",
    session_id: "",
    start_time: "",
    duration: 30,
    exam_name: "",
    exam_date: "",
    display_question_randomly: 1,
    exam_mode: "graded",
    instruction: "Answer all questions",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openConfirm, setOpenConfirm] = useState({
    open: false,
    title: "",
    data: null,
    message: "",
    button: "",
    action: null,
  });
  const [openExamQuestionModal, setOpenExamQuestionModal] = useState({
    open: false,
    exam: null,
  });
  const [addQuestionModal, setAddQuestionModal] = useState({
    open: false,
    question: null,
    title: "Add Question",
    button: "Save Question",
    action: (question) => {
      console.log("Add question:", question);
    },  
  });

   const [editQuestionModal, setEditQuestionModal] = useState({
     open: false,
     question: null,
     title: "Edit Question",
     button: "Save Changes",
     action: (question) => {
       console.log("Edit question:", question);
     },
   });

  const [examQuestions, setExamQuestions] = useState([]);
  const getExamQuestions = async (id) => {
    try {
      const questions = await getQuestionsForExam(id);
      setExamQuestions(questions.data || []);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      throw error;
    }
  };
  useEffect(() => {
    if (openExamQuestionModal.open && openExamQuestionModal.exam) {
      getExamQuestions(openExamQuestionModal.exam.id);
    }
  }, [openExamQuestionModal.open, openExamQuestionModal.exam]);

  const handleCloseConfirm = () => {
    setOpenConfirm({
      open: false,
      title: "",
      data: null,
      message: "",
    });
  };

  const handleActivate = async (id, active) => {
    try {
      await toggleExamActive(id);
      const exams = await getAllExams();
      setExams(exams.data.exams || []);
      showSnackbar(
        `Exam ${active ? "Activated" : "Deactivated"} Successfully!`,
        "success",
      );
    } catch (error) {
      console.log(error.response.data);
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchData = useCallback(async () => {
    try {
      const [examRes, courseRes, deptRes, sessionRes] = await Promise.all([
        getAllExams(),
        getCourses(),
        getDepartments(),
        getSessions(),
      ]);

      setExams(examRes.data.exams);
      setCourses(courseRes.data.courses || []);
      setDepartments(deptRes.data.departments || []);
      setSessions(sessionRes.data.sessions || []);

      showSnackbar(
        "Exams, Sessions, Courses, Departments and Levels Fetched!",
        "success",
      );
    } catch (error) {
      setExams([]);
      setCourses([]);
      setDepartments([]);
      setSessions([]);
      console.log(error);
      showSnackbar("Error Fetching Data", "error");
    }
  }, []);
  const handleSubmitExam = async () => {
    try {
      const payload = {
        course_id: newExam.course_id,
        exam_name: newExam.exam_name,
        department_id: newExam.department_id,
        level: newExam.level,
        semester: newExam.semester,
        session_id: newExam.session_id,
        start_time: newExam.start_time,
        duration: newExam.duration,
        exam_date: newExam.exam_date,
        exam_mode: newExam.exam_mode,
        max_score_obtainable: newExam.max_score_obtainable,
        display_question_randomly: newExam.display_question_randomly,
        instruction: newExam.instruction,
        server_time: newExam.server_time,
      };
      const res = await createExam(payload);
      if (res.data.success) {
        showSnackbar("Exam created successfully!", "success");
        const exams = await getAllExams();
        setExams(exams.data.exams || []);
      } else {
        showSnackbar(res.data.message || "Failed to create exam", "error");
      }
    } catch (err) {
      console.log(err);
      showSnackbar(
        err.response?.data?.message || "Failed to create exam",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = (exam = null, index = null) => {
    if (exam) {
      setNewExam({
        id: exam.id || "",
        course_id: exam.course_id || "",
        exam_name: exam.exam_name || "",
        level: exam.level || "",
        session_id: exam.session_id || "",
        semester: exam.semester || "",
        max_score_obtainable: exam.max_score_obtainable || "",
        start_time: exam.start_time || "",
        duration: exam.duration || "",
        exam_date: exam.exam_date || "",
        display_question_randomly: exam.display_question_randomly,
        departments: exam.departments,
        exam_mode: exam.exam_mode,
        instruction: exam.instruction || "",
        server_time: exam.server_time || "",
      });
      setEditIndex(index);
    } else {
      setNewExam({
        course_id: "",
        exam_name: "",
        department_id: [],
        level: "",
        session_id: "",
        semester: "",
        duration: 30,
        exam_date: "",
        start_time: "",
        exam_mode: "graded",
        display_question_randomly: 1,
        max_score_obtainable: 70,
        instruction: "Answer all Question",
        server_time: 0,
      });
      setEditIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewExam({ ...newExam, [e.target.name]: e.target.value });
  };

  const handleSaveExam = async () => {
    if (editIndex !== null) {
      try {
        const res = await updateExam(newExam);
        if (res.status === 200) {
          showSnackbar("Exam Updated Successfully!", "success");
          const examRes = await getAllExams();
          setExams(examRes.data.exams || []);
        }
      } catch (error) {
        console.log(error);
        showSnackbar("Error Updating Exam", "error");
      }
    } else {
      handleSubmitExam();
    }
    handleClose();
  };

  const handleDeleteExam = async (id) => {
    try {
      const res = await deleteExam(id);
      if (res.status === 200) {
        const exams = await getAllExams();
        setExams(exams.data.exams || []);
        showSnackbar("Exam Deleted Successfully!", "success");
        return;
      } else {
        showSnackbar(res.data.message || "There was an error", "error");
        return;
      }
    } catch (error) {
      console.log(error.response.data);
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // Function to render exam questions in a table
  const renderExamQuestionsTable = () => {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>S/N</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Question Text</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Correct Option</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Instructions</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Score Obtainable</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {examQuestions.map((question, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{question.text}</TableCell>
              <TableCell>{question.correct_option}</TableCell>
              <TableCell>{question.instruction || "N/A"}</TableCell>
              <TableCell>{question.score_obtainable}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() =>
                      setEditQuestionModal({
                        open: true,
                        question: question,
                        title: "Edit Question",
                        button: "Save Changes",
                        action: () => {
                          handleEditQuestion(question.question_id);
                        },
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() =>
                      setOpenConfirm({
                        open: true,
                        data: question,
                        title: "Delete Question",
                        message:
                          "Are you sure you want to delete this question?",
                        button: "Delete Question",
                        action: () => {
                          handleDeleteQuestion(question.question_id);
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Handlers for editing and deleting questions
  const handleEditQuestion = (question) => {
    console.log("Edit question:", question);
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const res = await deleteQuestion(id);
      console.log(res.data);
      if (res.data.success) {
        showSnackbar("Question deleted successfully!", "success");
        await getExamQuestions(openExamQuestionModal.exam.id);
      }
    } catch (error) {
      showSnackbar("Error deleting question!", "error");
    }
  };

  // Handlers for new actions
  const handleAddNewQuestion = async (exam, question) => {
    console.log(exam.id, exam.course_id, question);
    try {
      const res = await addQuestionsToExam(exam.id, exam.course_id, question);
      console.log(res.data);
      getExamQuestions(exam.id);
      showSnackbar("Question added to exam successfully!", "success");
    } catch (error) {
      console.log("Error adding question to exam:", error);
      showSnackbar("Error adding question to exam!", "error");
    }
  };

  const handleDeleteAllQuestions = () => {
    console.log("Delete all questions");
    // Implement delete all questions functionality here
  };

  const handleBulkUploadQuestions = () => {
    console.log("Bulk upload questions via CSV");
    // Implement bulk upload functionality here
  };

  return (
    <>
      <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2C2C78",
            fontSize: { xs: 18, sm: 24 },
          }}
        >
          Manage Exams
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
            onClick={() => handleOpen()}
          >
            Add Exam
          </Button>
          <TextField
            label="Search Exams"
            variant="outlined"
            size="small"
            sx={{ minWidth: 250 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                S/N
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                Exam Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                Exam Title
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                Departments
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                Level
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                Time
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                Duration
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams
              .filter(
                (ex) =>
                  ex.course_code.toLowerCase().includes(search.toLowerCase()) ||
                  ex.course_name.toLowerCase().includes(search.toLowerCase()),
              )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ex, index) => (
                <TableRow key={ex.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{ex.course_code}</TableCell>
                  <TableCell>{ex.course_name}</TableCell>
                  <TableCell>{ex.departments}</TableCell>
                  <TableCell>{ex.level}</TableCell>
                  <TableCell>{ex.exam_date}</TableCell>
                  <TableCell>{ex.start_time}</TableCell>
                  <TableCell>{ex.duration} mins</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        onClick={() =>
                          setOpenConfirm({
                            open: true,
                            title: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                            data: ex,
                            message: `Are you sure you want to ${ex.active ? "deactivate" : "activate"} ${ex.exam_name}?`,
                            button: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                            action: () => handleActivate(ex.id, !ex.active),
                          })
                        }
                        variant="contained"
                        sx={{
                          bgcolor: ex.active ? "orange" : "green",
                          ":hover": {
                            bgcolor: ex.active ? "darkorange" : "darkgreen",
                          },
                        }}
                      >
                        {ex.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        color="white"
                        size="small"
                        sx={{
                          bgcolor: "#7f7ff5",
                          borderRadius: 2,
                          p: 1,
                          boxShadow: 1,
                          ":hover": { bgcolor: "#1515e9", color: "white" },
                        }}
                        onClick={() => handleOpen(ex, index)}
                        aria-label="Edit Course"
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        size="small"
                        sx={{
                          bgcolor: "#fdecea",
                          borderRadius: 2,
                          p: 1,
                          boxShadow: 1,
                          ":hover": { bgcolor: "#ef1912", color: "white" },
                        }}
                        onClick={() =>
                          setOpenConfirm({
                            open: true,
                            title: "Confirm Exam Deletion",
                            message: `Are you sure you want to delete ${ex.exam_name}?`,
                            data: ex,
                            button: "Delete Exam",
                            action: () => handleDeleteExam(ex.id),
                          })
                        }
                        aria-label="Delete Course"
                      >
                        Delete
                      </Button>
                      <Button
                        color="white"
                        size="small"
                        sx={{
                          bgcolor: "#25d0f3",
                          borderRadius: 2,
                          p: 1,
                          boxShadow: 1,
                          ":hover": { bgcolor: "#0b97ba", color: "white" },
                        }}
                        onClick={() =>
                          setOpenExamQuestionModal({
                            open: true,
                            exam: ex,
                          })
                        }
                      >
                        Manage Questions
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={exams.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editIndex !== null ? "Edit Exam" : "Add Exam"}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Exam Name"
              name="exam_name"
              sx={{ width: 200, mr: 2 }}
              value={newExam.exam_name}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              select
              margin="dense"
              label="Course"
              name="course_id"
              sx={{ width: 300, mr: 2 }}
              value={newExam.course_id}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            >
              {courses.map((cs) => (
                <MenuItem key={cs.id} value={cs.id}>
                  {cs.code} - {cs.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              margin="dense"
              label="Semester"
              name="semester"
              sx={{ width: 140, mr: 2 }}
              value={newExam.semester}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="First">First Semester</MenuItem>
              <MenuItem value="Second">Second Semester</MenuItem>
            </TextField>
            <TextField
              select
              margin="dense"
              label="Level"
              name="level"
              sx={{ width: 145, mr: 2 }}
              value={newExam.level}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="Level 100">100 Level</MenuItem>
              <MenuItem value="Level 200">200 Level</MenuItem>
              <MenuItem value="Level 300">300 Level</MenuItem>
              <MenuItem value="Level 400">400 Level</MenuItem>
              <MenuItem value="Level 500">500 Level</MenuItem>
              <MenuItem value="Level 600">600 Level</MenuItem>
            </TextField>
            <TextField
              select
              margin="dense"
              label="Session"
              name="session_id"
              sx={{ width: 200, mr: 2 }}
              value={newExam.session_id}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            >
              {sessions.map((sess) => (
                <MenuItem key={sess.id} value={sess.id}>
                  {sess.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              margin="dense"
              label="Departments"
              multiple
              name="department_id"
              sx={{ width: 400, mr: 2 }}
              value={
                Array.isArray(newExam.department_id)
                  ? newExam.department_id
                  : []
              }
              onChange={(e) =>
                setNewExam({
                  ...newExam,
                  department_id: e.target.value,
                })
              }
              InputLabelProps={{
                shrink: true,
              }}
              SelectProps={{
                multiple: true,
                renderValue: (selected) =>
                  selected
                    .map(
                      (id) => departments.find((dept) => dept.id === id)?.name,
                    )
                    .join(", "),
              }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              margin="dense"
              label="Exam Mode"
              name="exam_mode"
              sx={{ width: 200, mr: 2 }}
              value={newExam.exam_mode}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="graded">Graded</MenuItem>
              <MenuItem value="not graded">Not Graded</MenuItem>
            </TextField>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                type="number"
                margin="dense"
                label="Duration"
                name="duration"
                sx={{ width: 120, mr: 2 }}
                value={newExam.duration}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              ></TextField>
              <TextField
                type="date"
                margin="dense"
                label="Exam Date"
                name="exam_date"
                sx={{ width: 200, mr: 2 }}
                value={newExam.exam_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              ></TextField>
              <TextField
                type="time"
                margin="dense"
                label="Start Time"
                name="start_time"
                sx={{ width: 200, mr: 2 }}
                value={newExam.start_time}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              ></TextField>
              <TextField
                type="number"
                margin="dense"
                label="Max Score"
                name="max_score_obtainable"
                sx={{ width: 100, mr: 2 }}
                value={newExam.max_score_obtainable}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              ></TextField>
              <TextField
                select
                margin="dense"
                label="Display Random"
                name="display_question_randomly"
                sx={{ width: 150, mr: 2 }}
                value={newExam.display_question_randomly}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Instruction"
                name="instruction"
                sx={{ width: 400, mr: 2 }}
                value={newExam.instruction}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                select
                margin="dense"
                label="Server Time"
                name="server_time"
                sx={{ width: 150, mr: 2 }}
                value={newExam.server_time}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              disabled={
                !newExam.course_id ||
                !newExam.exam_name ||
                !newExam.department_id ||
                !newExam.semester ||
                !newExam.exam_mode ||
                !newExam.session_id ||
                !newExam.duration
              }
              variant="contained"
              sx={{ bgcolor: "#2C2C78" }}
              onClick={handleSaveExam}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openConfirm.open}
          onClose={() => {
            handleCloseConfirm();
          }}
        >
          <DialogTitle>
            <Typography>{openConfirm.title}</Typography>
            <DialogContent>
              <Typography>{openConfirm.message}</Typography>
              <DialogActions>
                <Button onClick={() => handleCloseConfirm()}>Cancel</Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    openConfirm.action(openConfirm.data.id);
                    handleCloseConfirm();
                  }}
                >
                  {openConfirm.button}
                </Button>
              </DialogActions>
            </DialogContent>
          </DialogTitle>
        </Dialog>
        <Dialog
          open={openExamQuestionModal.open}
          onClose={() => setOpenExamQuestionModal({ open: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "#2C2C78",
              color: "white",
              textAlign: "center",
              gap: 1,
            }}
          >
            Manage Questions for Exam: {openExamQuestionModal.exam?.exam_name}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  setAddQuestionModal({
                    open: true,
                    question: null,
                    title: "Add New Question",
                    button: "Save Question",
                    action: (question) =>
                      handleAddNewQuestion(
                        openExamQuestionModal.exam,
                        question,
                      ),
                  })
                }
              >
                Add New Question
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAllQuestions}
              >
                Delete All Questions
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBulkUploadQuestions}
              >
                Bulk Upload CSV
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {examQuestions.length > 0 ? (
              renderExamQuestionsTable()
            ) : (
              <Typography variant="body2" color="textSecondary">
                No questions available for this exam.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={addQuestionModal.open}
          onClose={() =>
            setAddQuestionModal({ open: false, question: null, title: "" })
          }
        >
          <DialogTitle>{addQuestionModal.title}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Question Text"
              fullWidth
              value={addQuestionModal.question?.text || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: { ...prev.question, text: e.target.value },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option A"
              fullWidth
              value={addQuestionModal.question?.option_a || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_a: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option B"
              fullWidth
              value={addQuestionModal.question?.option_b || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_b: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option C"
              fullWidth
              value={addQuestionModal.question?.option_c || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_c: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option D"
              fullWidth
              value={addQuestionModal.question?.option_d || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_d: e.target.value,
                  },
                }))
              }
            />
            <TextField
              select
              margin="dense"
              label="Correct Option"
              fullWidth
              value={addQuestionModal.question?.correct_option || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    correct_option: e.target.value,
                  },
                }))
              }
            >
              {["A", "B", "C", "D"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              margin="dense"
              label="Score Obtainable"
              fullWidth
              value={addQuestionModal.question?.score_obtainable || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    score_obtainable: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Instructions"
              fullWidth
              multiline
              rows={3}
              value={addQuestionModal.question?.instruction || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: { ...prev.question, instruction: e.target.value },
                }))
              }
            />
            <Box sx={{ mt: 2 }}>
              {addQuestionModal.question?.image && (
                <img
                  src={addQuestionModal.question.image}
                  alt="Question"
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              )}
              <Button variant="contained" component="label" color="secondary">
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setAddQuestionModal((prev) => ({
                          ...prev,
                          question: { ...prev.question, image: reader.result },
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setAddQuestionModal({
                  open: false,
                  question: null,
                  title: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addQuestionModal.action(addQuestionModal.question);
                setAddQuestionModal({
                  open: false,
                  question: null,
                  title: "",
                });
              }}
            >
              {addQuestionModal.button}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={editQuestionModal.open}
          onClose={() =>
            setEditQuestionModal({ open: false, question: null, title: "" })
          }
        >
          <DialogTitle>{editQuestionModal.title}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Question Text"
              fullWidth
              value={editQuestionModal.question?.text || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: { ...prev.question, text: e.target.value },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option A"
              fullWidth
              value={editQuestionModal.question?.option_a || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_a: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option B"
              fullWidth
              value={editQuestionModal.question?.option_b || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_b: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option C"
              fullWidth
              value={editQuestionModal.question?.option_c || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_c: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Option D"
              fullWidth
              value={editQuestionModal.question?.option_d || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    option_d: e.target.value,
                  },
                }))
              }
            />
            <TextField
              select
              margin="dense"
              label="Correct Option"
              fullWidth
              value={editQuestionModal.question?.correct_option || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    correct_option: e.target.value,
                  },
                }))
              }
            >
              {["A", "B", "C", "D"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              margin="dense"
              label="Score Obtainable"
              fullWidth
              value={editQuestionModal.question?.score_obtainable || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    score_obtainable: e.target.value,
                  },
                }))
              }
            />
            <TextField
              margin="dense"
              label="Instructions"
              fullWidth
              multiline
              rows={3}
              value={editQuestionModal.question?.instruction || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: { ...prev.question, instruction: e.target.value },
                }))
              }
            />
            <Box sx={{ mt: 2 }}>
              {editQuestionModal.question?.image && (
                <img
                  src={editQuestionModal.question.image}
                  alt="Question"
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              )}
              <Button variant="contained" component="label" color="secondary">
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setEditQuestionModal((prev) => ({
                          ...prev,
                          question: { ...prev.question, image: reader.result },
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setEditQuestionModal({
                  open: false,
                  question: null,
                  title: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                editQuestionModal.action(editQuestionModal.question);
                setEditQuestionModal({
                  open: false,
                  question: null,
                  title: "",
                });
              }}
            >
              {editQuestionModal.button}
            </Button>
          </DialogActions>
        </Dialog>
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
    </>
  );
}
