import React, { useState, useCallback, useRef } from "react";
import { useEffect } from "react";
import { getCourses, getSessions } from "../../api/faculties";
import { getDepartments } from "../../api/departments";
import {
  getAllExams,
  getActiveExams,
  updateExam,
  createExam,
  deleteExam,
  toggleExamActive,
  getQuestionsForExam,
  addQuestionsToExam,
  deleteQuestion,
  updateQuestion,
  bulkUploadQuestions,
  deleteAllQuestionsFromExam,
} from "../../api/exams";
import moment from "moment";

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
  IconButton,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  TablePagination,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Delete,
  Edit,
  QuestionMark,
  Check,
  CheckBox,
  Add
} from "@mui/icons-material";
import { Editor } from "@tinymce/tinymce-react";

export default function AdminExams() {
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  log();
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
    course_id: "",
    exam_name: "",
    department_id: [],
    level: "",
    semester: "First",
    session_id: 1,
    start_time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    duration: 30,
    exam_date: new Date().toISOString().split("T")[0],
    exam_mode: "graded",
    max_score_obtainable: 70,
    display_question_randomly: 0,
    instruction: "Answer all questions",
    exam_hall: 1,
    server_time: 0,
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
  const [addTheoryQuestionModal, setAddTheoryQuestionModal] = useState({
    open: false,
    question: "",
    title: "Add Theory Question",
    button: "Save Theory Question",
    action: (question) => {
      console.log("Add theory question:", question);
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
  const [editTheoryModal, setEditTheoryModal] = useState({
    open: false,
    content: "",
    instructions: "",
    title: "Edit Theory Question",
    button: "Save Changes",
    action: (question) => {
      console.log("Edit theory question:", question);
    },
  });

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
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
      if (tab === 0) {
        const exams = await getAllExams();
        setExams(exams.data.exams || []);
      } else {
        const res =  await getActiveExams();
        setActiveExams(res.data.exams || []);
      }
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
        exam_hall: newExam.exam_hall,
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

  const handleOpen = (exam, index) => {
    setEditIndex(index);
    if (exam) {
      setNewExam({
        ...exam,
        department_id: exam.department_id
          ? exam.department_id?.split(",").map((id) => parseInt(id, 10))
          : null,
      });
    } else {
      setNewExam({
        course_id: "",
        exam_name: "",
        department_id: [],
        level: "",
        semester: "First",
        session_id: 1,
        start_time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        duration: 30,
        exam_date: new Date().toISOString().split("T")[0],
        exam_mode: "graded",
        max_score_obtainable: 70,
        display_question_randomly: 0,
        instruction: "Answer all questions",
        exam_hall: 1,
        server_time: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setNewExam({ ...newExam, [e.target.name]: e.target.value });
  };
  const handleBulkUpload = (e) => {
    setFile(e.target.files[0]);
  };
  const handleSaveExam = async () => {
    if (editIndex) {
      try {
        const res = await updateExam(newExam);
        if (res.status === 200) {
          showSnackbar("Exam Updated Successfully!", "success");
          const examRes = await getAllExams();
          setExams(examRes.data.exams || []);
        }
      } catch (error) {
        console.log(error);
        showSnackbar(error.response.data.error, "error");
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
            <TableCell sx={{ fontWeight: "bold" }}>Question Type</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {examQuestions.map((question, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{question.text}</TableCell>
              <TableCell>{question.correct_option}</TableCell>
              <TableCell>{question.instructions || "N/A"}</TableCell>
              <TableCell>{question.score_obtainable}</TableCell>
              <TableCell>{question.question_type}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    onClick={() =>
                      question.question_type === "Objective"
                        ? setEditQuestionModal({
                            open: true,
                            question: question,
                            title: "Edit Question",
                            button: "Save Changes",
                            action: () => {
                              handleEditQuestion(question);
                            },
                          })
                        : editTheoryQuestion(question)
                    }
                  >
                    {question.question_type === "Theory"
                      ? "Edit Theory Question"
                      : "Edit"}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ fontSize: "0.75rem", padding: "4px 8px" }}
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

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEditQuestion = async (question) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      Object.keys(question).forEach((key) => {
        formData.append(key, question[key]);
      });
      await updateQuestion(question.question_id, formData);
      await getExamQuestions(openExamQuestionModal.exam.id);
      showSnackbar("Question updated successfully!", "success");
      setFile(null);
      setEditQuestionModal({
        ...editQuestionModal,
        open: false,
        question: null,
      });
    } catch (error) {
      console.error("Error updating question:", error);
      showSnackbar(error.response.data.error, "error");
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const res = await deleteQuestion(id);
      if (res.data.success) {
        showSnackbar("Question deleted successfully!", "success");
        await getExamQuestions(openExamQuestionModal.exam.id);
      }
    } catch (error) {
      console.log(error);
      showSnackbar(error.response.data.error, "error");
    }
  };

  // Handlers for new actions
  const handleAddNewQuestion = async (exam, question) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      Object.keys(question).forEach((key) => {
        formData.append(key, question[key]);
      });
      formData.append("question_type", "objective");
      formData.append("course_id", exam.course_id);
      await addQuestionsToExam(exam.id, formData);
      await getExamQuestions(exam.id);
      showSnackbar("Question added to exam successfully!", "success");
    } catch (error) {
      console.log("Error adding question to exam:", error);
      showSnackbar(error.response.data.error, "error");
    }
  };

  const handleDeleteAllQuestions = async (id) => {
    try {
      await deleteAllQuestionsFromExam(id);
      showSnackbar("All questions deleted from exam successfully!", "success");
      await getExamQuestions(id);
    } catch (error) {
      showSnackbar(error.response.data.error, "error");
      console.log(error);
    }
  };

  const handleBulkUploadQuestions = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await bulkUploadQuestions(openExamQuestionModal.exam.id, formData);
      showSnackbar("Questions uploaded successfully!", "success");
      await getExamQuestions(openExamQuestionModal.exam.id);
      setFile(null);
      setBulkUploadOpen(false);
    } catch (error) {
      showSnackbar("There was an error uploading the questions", "error");
      console.log(error);
    }
  };
  const handleAddTheoryQuestion = async (exam, question) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("course_id", exam.course_id);
      formData.append("text", addTheoryQuestionModal.question);
      formData.append("instructions", addTheoryQuestionModal.instructions);
      formData.append("question_type", "Theory");
      const res = await addQuestionsToExam(exam.id, formData);
      console.log(res.data);
      if (res.data.success) {
        showSnackbar("Theory question added successfully!", "success");
        await getExamQuestions(exam.id);
        setAddTheoryQuestionModal({
          ...addTheoryQuestionModal,
          open: false,
          question: "",
        });
        setFile(null);
      }
    } catch (error) {
      console.log(error);
      showSnackbar("There was an error adding the theory question", "error");
    }
  };

  const editTheoryQuestion = async (question) => {
    setEditTheoryModal({
      open: true,
      id: question.question_id,
      content: question.text || "",
      instructions: question.instructions || "",
      title: "Edit Theory Question",
      button: "Save Changes",
      action: () => {
        handleEditTheoryQuestion(question);
      },
    });
  };
  const handleEditTheoryQuestion = async (exam, question) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("text", question.question);
      formData.append("instructions", question.instructions);
      formData.append("question_type", "Theory");
      formData.append("course_id", exam.course_id);
      const res = await updateQuestion(question.id, formData);
      if (res.data.success) {
        showSnackbar("Theory question updated successfully!", "success");
        await getExamQuestions(exam.id);
        setEditTheoryModal({
          ...editTheoryModal,
          open: false,
          content: "",
        });
        setFile(null);
      }
    } catch (error) {
      console.log(error);
      showSnackbar("There was an error updating the theory question", "error");
    }
  };

  const [tab, setTab] = useState(0);
  const [activeExams, setActiveExams] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (tab === 0) fetchData();
    else {
      const res = getActiveExams();
      res
        .then((response) => {
          setActiveExams(response.data.exams);
        })
        .catch((error) => {
          console.log("Error fetching active exams:", error);
        });
    }
  }, [fetchData, tab]);
  return (
    <>
      <Box
        p={{ xs: 1, sm: 3 }}
        sx={{
          maxWidth: 900,
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2C2C78",
            fontSize: { xs: 18, sm: 24 },
            textAlign: { xs: "center", sm: "left" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          Manage Exams
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="students tabs"
            variant="fullWidth"
            sx={{ maxWidth: 900 }}
          >
            <Tab label="View Exams" />
            <Tab label="Active Exams" />
          </Tabs>
        </Box>
        {tab === 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                placeholder="Search Exam"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => handleOpen(null, null)}
              >
                Add Exam
              </Button>
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
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams
                  .filter(
                    (ex) =>
                      ex.course_code
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      ex.course_name
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ex, index) => (
                    <TableRow key={ex.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{ex.course_code}</TableCell>
                      <TableCell>{ex.course_name}</TableCell>
                      <TableCell>{ex.departments}</TableCell>
                      <TableCell>{ex.level}</TableCell>
                      <TableCell>
                        {moment(ex.exam_date).format("MMMM Do YYYY")}
                      </TableCell>
                      <TableCell sx={{ width: "50%" }}>
                        {moment(ex.start_time, "HH:mm").format("LT")}
                      </TableCell>
                      <TableCell>{ex.duration} mins</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip
                            title={
                              ex.active ? "Deactivate Exam" : "Activate Exam"
                            }
                            arrow
                          >
                            <IconButton
                              aria-label={
                                ex.active ? "Deactivate Exam" : "Activate Exam"
                              }
                              color={ex.active ? "success" : "default"}
                              size="small"
                              sx={{
                                bgcolor: "#c0f1ce",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() =>
                                setOpenConfirm({
                                  open: true,
                                  title: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                                  data: ex,
                                  message: `Are you sure you want to ${ex.active ? "deactivate" : "activate"} ${ex.exam_name}?`,
                                  button: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                                  action: () =>
                                    handleActivate(ex.id, !ex.active),
                                })
                              }
                            >
                              {" "}
                              {ex.active ? (
                                <CheckBox defaultChecked />
                              ) : (
                                <Check fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Exam" arrow>
                            <IconButton
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: "#e3e3fa",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() => handleOpen(ex, ex.id)}
                              aria-label="Edit Exam"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Exam" arrow>
                            <IconButton
                              color="error"
                              size="small"
                              sx={{
                                bgcolor: "#e3e3fa",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() =>
                                setOpenConfirm({
                                  open: true,
                                  title: "Confirm Exam Deletion",
                                  message: `Are you sure you want to delete ${ex.course_code}?`,
                                  data: ex,
                                  button: "Delete Exam",
                                  action: () => handleDeleteExam(ex.id),
                                })
                              }
                              aria-label="Delete Exam"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Questions" arrow>
                            <IconButton
                              color="secondary"
                              size="small"
                              sx={{
                                bgcolor: "#e3e3fa",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() =>
                                setOpenExamQuestionModal({
                                  open: true,
                                  exam: ex,
                                })
                              }
                              aria-label="Manage Questions"
                            >
                              <QuestionMark fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          </>
        )}
        {tab === 1 && (
          <>
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
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeExams
                  .filter(
                    (ex) =>
                      ex.course_code
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      ex.course_name
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ex, index) => (
                    <TableRow key={ex.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{ex.course_code}</TableCell>
                      <TableCell>{ex.course_name}</TableCell>
                      <TableCell>{ex.departments}</TableCell>
                      <TableCell>{ex.course_level}</TableCell>
                      <TableCell>
                        {moment(ex.exam_date).format("MMMM Do YYYY")}
                      </TableCell>
                      <TableCell sx={{ width: "50%" }}>
                        {moment(ex.start_time, "HH:mm").format("LT")}
                      </TableCell>
                      <TableCell>{ex.duration} mins</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip
                            title={
                              ex.active ? "Deactivate Exam" : "Activate Exam"
                            }
                            arrow
                          >
                            <IconButton
                              aria-label={
                                ex.active ? "Deactivate Exam" : "Activate Exam"
                              }
                              color={ex.active ? "success" : "default"}
                              size="small"
                              sx={{
                                bgcolor: "#c0f1ce",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() =>
                                setOpenConfirm({
                                  open: true,
                                  title: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                                  data: ex,
                                  message: `Are you sure you want to ${ex.active ? "deactivate" : "activate"} ${ex.exam_name}?`,
                                  button: `${ex.active ? "Deactivate" : "Activate"} Exam`,
                                  action: () =>
                                    handleActivate(ex.id, !ex.active),
                                })
                              }
                            >
                              {" "}
                              {ex.active ? (
                                <CheckBox defaultChecked />
                              ) : (
                                <Check fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Exam" arrow>
                            <IconButton
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: "#e3e3fa",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() => handleOpen(ex, ex.id)}
                              aria-label="Edit Exam"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Questions" arrow>
                            <IconButton
                              color="secondary"
                              size="small"
                              sx={{
                                bgcolor: "#e3e3fa",
                                borderRadius: 2,
                                p: 0.25,
                                boxShadow: 1,
                                ":hover": { bgcolor: "#d1d1f7" },
                              }}
                              onClick={() =>
                                setOpenExamQuestionModal({
                                  open: true,
                                  exam: ex,
                                })
                              }
                              aria-label="Manage Questions"
                            >
                              <QuestionMark fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          </>
        )}
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
              <MenuItem value="100 Level">100 Level</MenuItem>
              <MenuItem value="200 Level">200 Level</MenuItem>
              <MenuItem value="300 Level">300 Level</MenuItem>
              <MenuItem value="400 Level">400 Level</MenuItem>
              <MenuItem value="500 Level">500 Level</MenuItem>
              <MenuItem value="600 Level">600 Level</MenuItem>
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
                label="Exam Hall"
                name="exam_hall"
                sx={{ width: 200, mr: 2 }}
                value={newExam.exam_hall}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value={1}>Hall 1</MenuItem>
                <MenuItem value={2}>Hall 2</MenuItem>
                <MenuItem value={3}>Hall 3</MenuItem>
                <MenuItem value={4}>Hall 4</MenuItem>
                <MenuItem value={5}>Hall 5</MenuItem>
              </TextField>
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
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
              }}
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
                Add New Objective Question
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() =>
                  setAddTheoryQuestionModal({
                    open: true,
                    question: null,
                    title: "Add New Theory Question",
                    button: "Save Theory Question",
                  })
                }
              >
                Add New Theory Question
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() =>
                  setOpenConfirm({
                    open: true,
                    title: "Delete All Questions",
                    message:
                      "Are you sure you want to delete all questions from this exam?",
                    button: "Delete All",
                    data: openExamQuestionModal.exam,
                    action: () => {
                      handleDeleteAllQuestions(openExamQuestionModal.exam.id);
                    },
                  })
                }
              >
                Delete All Questions
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setBulkUploadOpen(true)}
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
              value={addQuestionModal.question?.instructions || ""}
              onChange={(e) =>
                setAddQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    instructions: e.target.value,
                  },
                }))
              }
            />
            <Box sx={{ mt: 2 }}>
              {addQuestionModal.question?.file && (
                <img
                  src={addQuestionModal.question.file}
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
                    handleFileChange(e);
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
          open={addTheoryQuestionModal.open}
          onClose={() =>
            setAddTheoryQuestionModal({
              open: false,
              question: null,
              title: "",
            })
          }
        >
          <DialogTitle>{addTheoryQuestionModal.title}</DialogTitle>
          <DialogContent>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue="Type or Paste Theory question here ..."
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "preview",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
              onEditorChange={(content) =>
                setAddTheoryQuestionModal({
                  ...addTheoryQuestionModal,
                  question: content,
                })
              }
            />
            <TextField
              margin="dense"
              label="Instructions"
              name="instructions"
              fullWidth
              multiline
              rows={2}
              value={addTheoryQuestionModal.instructions || ""}
              onChange={(e) =>
                setAddTheoryQuestionModal({
                  ...addTheoryQuestionModal,
                  instructions: e.target.value,
                })
              }
            />
            <Box sx={{ mt: 2 }}>
              {addQuestionModal.question?.file && (
                <img
                  src={addQuestionModal.question.file}
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
                    handleFileChange(e);
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setAddTheoryQuestionModal({
                  ...addTheoryQuestionModal,
                  open: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleAddTheoryQuestion(
                  openExamQuestionModal.exam,
                  addTheoryQuestionModal.question,
                );
                setAddTheoryQuestionModal({
                  ...addTheoryQuestionModal,
                  open: false,
                });
              }}
            >
              {addTheoryQuestionModal.button}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={editTheoryModal.open}
          onClose={() =>
            setEditTheoryModal({
              open: false,
              question: null,
              title: "",
            })
          }
        >
          <DialogTitle>{editTheoryModal.title}</DialogTitle>
          <DialogContent>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue={
                editTheoryModal.content ||
                "Type or Paste Theory question here ..."
              }
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "preview",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
              onEditorChange={(content) =>
                setEditTheoryModal({
                  ...editTheoryModal,
                  question: content,
                })
              }
            />
            <TextField
              margin="dense"
              label="Instructions"
              name="instructions"
              fullWidth
              multiline
              rows={2}
              value={editTheoryModal.instructions || ""}
              onChange={(e) =>
                setEditTheoryModal({
                  ...editTheoryModal,
                  instructions: e.target.value,
                })
              }
            />
            <Box sx={{ mt: 2 }}>
              {addQuestionModal.question?.file && (
                <img
                  src={addQuestionModal.question.file}
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
                    handleFileChange(e);
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setEditTheoryModal({
                  ...editTheoryModal,
                  open: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleEditTheoryQuestion(
                  openExamQuestionModal.exam,
                  editTheoryModal,
                );
                setEditTheoryModal({
                  ...editTheoryModal,
                  open: false,
                });
              }}
            >
              {addTheoryQuestionModal.button}
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
              value={editQuestionModal.question?.instructions || ""}
              onChange={(e) =>
                setEditQuestionModal((prev) => ({
                  ...prev,
                  question: {
                    ...prev.question,
                    instructions: e.target.value,
                  },
                }))
              }
            />
            <Box sx={{ mt: 2 }}>
              {editQuestionModal.question?.file && (
                <img
                  src={`http://localhost:5000/${editQuestionModal.question.file}`}
                  alt="Question"
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              )}
              <Button variant="contained" component="label" color="secondary">
                Change Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    handleFileChange(e);
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
                handleEditQuestion(editQuestionModal.question);
              }}
            >
              {editQuestionModal.button}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)}>
          <DialogTitle>Bulk Upload Questions via CSV</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Please upload the template CSV file with questions!.
            </Typography>
            <Button variant="contained" component="label" color="primary">
              Select CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={(e) => {
                  handleBulkUpload(e);
                }}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkUploadOpen(false)}>Cancel</Button>
            <Button
              disabled={!file}
              variant="contained"
              color="primary"
              onClick={() => {
                handleBulkUploadQuestions(file);
              }}
            >
              Upload
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
    </>
  );
}
