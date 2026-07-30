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
  getAttendance,
  getTodaysAttendance,
  getBlockList,
  bulkUploadBlockList,
  removeFromBlockList,
} from "../../api/exams";
import moment from "moment";
import parse from "html-react-parser";

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
  Autocomplete,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
} from "@mui/material";
import {
  Delete,
  Edit,
  QuestionMark,
  Check,
  CheckBox,
  Add,
} from "@mui/icons-material";
import { Editor } from "@tinymce/tinymce-react";

export default function AdminExams() {
  const editorRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  log();
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [search, setSearch] = useState("");
  const [searchAttendance, setSearchAttendance] = useState("");
  const [searchBlocklist, setSearchBlocklist] = useState("");
  const [filterModal, setFilterModal] = useState(false);
  const [blocklistModal, setBlocklistModal] = useState(false);
  const [blocklistOptions, setBlocklistOptions] = useState({
    blockByExam: false,
    exam_id: "",
  });
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [attendanceField, setAttendanceField] = useState({
    exam_id: "",
    session_id: "",
    semester: "",
    date: new Date().toISOString().split("T")[0],
  });

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
    display_question_randomly: 1,
    instruction: "Answer all questions",
    exam_hall: 0,
    server_time: 0,
  });
  const [page, setPage] = useState(0);
  const [atPage, setAtPage] = useState(0);
  const [blPage, setBlPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [atRowsPerPage, setAtRowsPerPage] = useState(10);
  const [blRowsPerPage, setBlRowsPerPage] = useState(10);
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
    instructions: "",
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
  const [blocklist, setBlocklist] = useState([]);

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
        const res = await getActiveExams();
        setActiveExams(res.data.exams || []);
      }
      showSnackbar(
        `Exam ${active ? "Activated" : "Deactivated"} Successfully!`,
        "success",
      );
    } catch (error) {
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

  const fetchBlocklist = useCallback(async () => {
    try {
      const res = await getBlockList();
      setBlocklist(res.data || []);
    } catch (error) {
      console.log(error);
      showSnackbar("Error Fetching Blocklist", "error");
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
        display_question_randomly: 1,
        instruction: "Answer all questions",
        exam_hall: 0,
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
  const handleChangeAtPage = (event, newPage) => setAtPage(newPage);
  const handleChangeBlPage = (event, newPage) => setBlPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleChangeAtRowsPerPage = (event) => {
    setAtRowsPerPage(parseInt(event.target.value, 10));
    setAtPage(0);
  };

  const handleChangeBlRowsPerPage = (event) => {
    setBlRowsPerPage(parseInt(event.target.value, 10));
    setBlPage(0);
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
              <TableCell>{parse(question.text)}</TableCell>
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

  const handleBlocklistOptionChange = (event) => {
    const { name, value, checked, type } = event.target;
    setBlocklistOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "blockByExam" && !checked ? { exam_id: "" } : {}),
    }));
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
      console.log(error);
      showSnackbar(error.response.data.error, "error");
    }
  };
  const handleAddTheoryQuestion = async (exam, question) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      const instructions = addTheoryQuestionModal.instructions ?? "";
      formData.append("course_id", exam.course_id);
      formData.append("text", addTheoryQuestionModal.question ?? "");
      formData.append("instructions", instructions);
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
          instructions: "",
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
    else if (tab === 1) {
      const res = getActiveExams();
      res
        .then((response) => {
          setActiveExams(response.data.exams);
        })
        .catch((error) => {
          console.log("Error fetching active exams:", error);
        });
    } else if (tab === 2) {
      getTodaysAttendance().then((response) => {
        setAttendance(response.data.attendanceRecords);
      });
    } else if (tab === 3) {
      fetchBlocklist();
    }
  }, [fetchData, tab]);

  const handleFilterAttendance = async () => {
    if (
      !attendanceField.exam_id ||
      !attendanceField.session_id ||
      !attendanceField.semester ||
      !attendanceField.date
    ) {
      showSnackbar("Please fill in all attendance fields", "error");
      return;
    }
    try {
      const res = await getAttendance(attendanceField);
      if (res.data.success) {
        setAttendance(res.data.attendanceRecords || []);
        setFilterModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockList = async () => {
    if (!file) {
      showSnackbar("Please select a CSV file first", "error");
      return;
    }

    if (blocklistOptions.blockByExam && !blocklistOptions.exam_id) {
      showSnackbar("Please select an exam for exam-specific blocking", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "block_type",
        blocklistOptions.blockByExam ? "exam" : "total",
      );
      if (blocklistOptions.blockByExam) {
        formData.append("exam_id", blocklistOptions.exam_id);
      }
      const res = await bulkUploadBlockList(formData);
      showSnackbar(
        res.data?.message ||
          "Students were added to the blocklist successfully",
        "success",
      );
      setBlocklistModal(false);
      setFile(null);
      setBlocklistOptions({ blockByExam: false, exam_id: "" });
      await fetchBlocklist();
    } catch (error) {
      console.log(error);
      showSnackbar(
        error.response?.data?.error || "Failed to upload blocklist students",
        "error",
      );
    }
  };

  const confirmRemoveFromBlocklist = (student) => {
    setOpenConfirm({
      open: true,
      title: "Confirm Unblock",
      data: student,
      message: `Are you sure you want to remove ${student.student_name} from the blocklist?`,
      button: "Unblock",
      action: async (id) => {
        try {
          await removeFromBlockList(id);
          showSnackbar(
            `${student.student_name} was removed from the blocklist`,
            "success",
          );
          await fetchBlocklist();
        } catch (error) {
          console.log(error);
          showSnackbar(
            error.response?.data?.error ||
              "Failed to update student block status",
            "error",
          );
        }
      },
    });
  };

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
            <Tab label="Attendance" />
            <Tab label="Block List" />
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
                    Course Code
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Course Title
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                    Departments
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
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
                      <TableCell>{ex.exam_name}</TableCell>
                      <TableCell>{ex.course_code}</TableCell>
                      <TableCell>{ex.course_name}</TableCell>
                      <TableCell>{ex.departments}</TableCell>

                      <TableCell>
                        {moment(ex.exam_date).format("MMMM Do YYYY")}
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>
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
                    Course Code
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Course Title
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                    Departments
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
                      ex.exam_name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((ex, index) => (
                    <TableRow key={ex.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{ex.exam_name}</TableCell>
                      <TableCell>{ex.course_code}</TableCell>
                      <TableCell>{ex.course_name}</TableCell>
                      <TableCell>{ex.departments}</TableCell>

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
                {activeExams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={60} align="center">
                      No Exam is active!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
        {tab === 2 && (
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
                placeholder="Search for Student"
                value={searchAttendance}
                onChange={(e) => setSearchAttendance(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button variant="contained" onClick={() => setFilterModal(true)}>
                Filter Attendance
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                    S/N
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Stdent Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Matric Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                    Exam
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    IP Address
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Started
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Submitted
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance
                  .filter(
                    (at) =>
                      at.student_name
                        .toLowerCase()
                        .includes(searchAttendance.toLowerCase()) ||
                      at.exam_name
                        .toLowerCase()
                        .includes(searchAttendance.toLowerCase()) ||
                      at.registration_number
                        .toLowerCase()
                        .includes(searchAttendance.toLowerCase()),
                  )
                  .slice(
                    atPage * atRowsPerPage,
                    atPage * atRowsPerPage + atRowsPerPage,
                  )
                  .map((at, index) => (
                    <TableRow key={at.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{at.student_name}</TableCell>
                      <TableCell>{at.registration_number}</TableCell>
                      <TableCell>{at.department}</TableCell>
                      <TableCell>{at.exam_name}</TableCell>
                      <TableCell>{at.ip_address}</TableCell>
                      <TableCell>
                        {at.login_timestamp
                          ? moment(at.login_timestamp).format("LT")
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ width: "50%" }}>
                        {at.stop_time
                          ? moment(at.stop_time).format("LT")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{at.status}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={attendance.length}
              page={atPage}
              onPageChange={handleChangeAtPage}
              rowsPerPage={atRowsPerPage}
              onRowsPerPageChange={handleChangeAtRowsPerPage}
            />
            <Dialog
              open={filterModal}
              onClose={() => setFilterModal(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Filter Attendance</DialogTitle>
              <DialogContent>
                <Box
                  sx={{ display: "flex", flexDirection: "row", gap: 1, mb: 1 }}
                >
                  <TextField
                    select
                    margin="dense"
                    label="Session"
                    name="session_id"
                    sx={{ width: 140 }}
                    value={attendanceField.session_id}
                    onChange={(event) => {
                      setAttendanceField({
                        ...attendanceField,
                        session_id: event.target.value,
                      });
                    }}
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
                    label="Semester"
                    name="semester"
                    sx={{ width: 160 }}
                    value={attendanceField.semester}
                    onChange={(event) => {
                      setAttendanceField({
                        ...attendanceField,
                        semester: event.target.value,
                      });
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  >
                    <MenuItem value="First">First Semester</MenuItem>
                    <MenuItem value="Second">Second Semester</MenuItem>
                    <MenuItem value="Mid Term">Mid Term</MenuItem>
                    <MenuItem value="Comprehensive">Comprehensive</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                  </TextField>
                  <TextField
                    select
                    margin="dense"
                    label="Exam"
                    name="exam_id"
                    sx={{ width: 300 }}
                    value={attendanceField.exam_id}
                    onChange={(event) => {
                      setAttendanceField({
                        ...attendanceField,
                        exam_id: event.target.value,
                      });
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  >
                    {exams.map((ex) => (
                      <MenuItem key={ex.id} value={ex.id}>
                        {ex.course_code} - {ex.course_name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="date"
                    margin="dense"
                    label="Exam Date"
                    name="date"
                    sx={{ width: 185, mr: 2 }}
                    value={attendanceField.date}
                    onChange={(event) => {
                      setAttendanceField({
                        ...attendanceField,
                        date: event.target.value,
                      });
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  ></TextField>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFilterModal(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2C2C78" }}
                  onClick={handleFilterAttendance}
                >
                  Filter
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 3 && (
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
                placeholder="Search for Student"
                value={searchBlocklist}
                onChange={(e) => setSearchBlocklist(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                onClick={() => setBlocklistModal(true)}
              >
                Block Students
              </Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                    S/N
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Matric Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Level
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Exam
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blocklist
                  .filter(
                    (bl) =>
                      bl.student_name
                        .toLowerCase()
                        .includes(searchBlocklist.toLowerCase()) ||
                      bl.matric_no
                        .toLowerCase()
                        .includes(searchBlocklist.toLowerCase()),
                  )
                  .slice(
                    blPage * blRowsPerPage,
                    blPage * blRowsPerPage + blRowsPerPage,
                  )
                  .map((bl, index) => (
                    <TableRow key={bl.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{bl.student_name}</TableCell>
                      <TableCell>{bl.matric_no}</TableCell>
                      <TableCell>{bl.department}</TableCell>
                      <TableCell>{bl.level}</TableCell>
                      <TableCell>{bl.exam}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => confirmRemoveFromBlocklist(bl)}
                        >
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={blocklist.length}
              page={blPage}
              onPageChange={handleChangeBlPage}
              rowsPerPage={blRowsPerPage}
              onRowsPerPageChange={handleChangeBlRowsPerPage}
            />
          </>
        )}
        <Dialog open={blocklistModal} onClose={() => setBlocklistModal(false)}>
          <DialogTitle>Add Student to Blocklist</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 1 }}
            >
              <Typography variant="body2" color="textSecondary">
                Upload a CSV file containing students to add to the blocklist.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="blockByExam"
                    checked={blocklistOptions.blockByExam}
                    onChange={handleBlocklistOptionChange}
                  />
                }
                label="Block Students only for a selected Exam"
              />
              {blocklistOptions.blockByExam && (
                <TextField
                  select
                  margin="dense"
                  label="Select Exam"
                  name="exam_id"
                  value={blocklistOptions.exam_id}
                  onChange={handleBlocklistOptionChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                >
                  <MenuItem value="">Select Exam</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.course_code} - {exam.course_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                variant="contained"
                component="label"
                color="secondary"
                sx={{ alignSelf: "flex-start" }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={(e) => handleFileChange(e)}
                />
              </Button>
              <Typography variant="body2" color="textSecondary">
                {file ? file.name : "No file selected"}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlocklistModal(false)}>Cancel</Button>
            <Button
              disabled={
                !file ||
                (blocklistOptions.blockByExam && !blocklistOptions.exam_id)
              }
              variant="contained"
              sx={{ bgcolor: "#2C2C78" }}
              onClick={handleBlockList}
            >
              Block Students
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editIndex !== null ? "Edit Exam" : "Add Exam"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mb: 1 }}>
              <TextField
                margin="dense"
                label="Exam Name"
                name="exam_name"
                sx={{ width: 200 }}
                value={newExam.exam_name}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Autocomplete
                options={courses}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                value={
                  courses.find((cs) => cs.id === newExam.course_id) || null
                }
                onChange={(event, newValue) => {
                  setNewExam({
                    ...newExam,
                    course_id: newValue ? newValue.id : "",
                  });
                }}
                sx={{ width: 400 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Course"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
              <TextField
                select
                margin="dense"
                label="Level"
                name="level"
                sx={{ width: 200 }}
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
                label="Semester"
                name="semester"
                sx={{ width: 200 }}
                value={newExam.semester}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value="First">First Semester</MenuItem>
                <MenuItem value="Second">Second Semester</MenuItem>
                <MenuItem value="Mid Term">Mid Term</MenuItem>
                <MenuItem value="Comprehensive">Comprehensive</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mb: 1 }}>
              <TextField
                select
                margin="dense"
                label="Session"
                name="session_id"
                sx={{ width: 120 }}
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
              <Autocomplete
                multiple
                options={departments}
                getOptionLabel={(option) => option.name}
                value={departments.filter((dept) =>
                  Array.isArray(newExam.department_id)
                    ? newExam.department_id.includes(dept.id)
                    : false,
                )}
                onChange={(event, newValue) => {
                  setNewExam({
                    ...newExam,
                    department_id: newValue.map((dept) => dept.id),
                  });
                }}
                sx={{ width: 400 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Departments"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
              <TextField
                margin="dense"
                label="Instruction"
                name="instruction"
                sx={{ width: 280 }}
                value={newExam.instruction}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
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
                sx={{ width: 185, mr: 2 }}
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
                sx={{ width: 185, mr: 2 }}
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
                sx={{ width: 120, mr: 2 }}
                value={newExam.max_score_obtainable}
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
                sx={{ width: 140, mr: 2 }}
                value={newExam.exam_hall}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              >
                <MenuItem value={0}>Select Hall</MenuItem>
                <MenuItem value={1}>Hall 1</MenuItem>
                <MenuItem value={2}>Hall 2</MenuItem>
                <MenuItem value={3}>Hall 3</MenuItem>
                <MenuItem value={4}>Hall 4</MenuItem>
                <MenuItem value={5}>Hall 5</MenuItem>
              </TextField>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: "0.8rem", minWidth: "70px" }}
                >
                  Exam Mode:
                </Typography>
                <RadioGroup
                  row
                  name="exam_mode"
                  value={newExam.exam_mode}
                  onChange={handleChange}
                  sx={{ gap: 0.5 }}
                >
                  <FormControlLabel
                    value="graded"
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<span style={{ fontSize: "0.75rem" }}>Graded</span>}
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    value="not graded"
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={
                      <span style={{ fontSize: "0.75rem" }}>Not Graded</span>
                    }
                    sx={{ m: 0 }}
                  />
                </RadioGroup>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: "0.8rem", minWidth: "85px" }}
                >
                  Display Random:
                </Typography>
                <RadioGroup
                  row
                  name="display_question_randomly"
                  value={newExam.display_question_randomly}
                  onChange={handleChange}
                  sx={{ gap: 0.5 }}
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<span style={{ fontSize: "0.75rem" }}>Yes</span>}
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    value={0}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<span style={{ fontSize: "0.75rem" }}>No</span>}
                    sx={{ m: 0 }}
                  />
                </RadioGroup>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, fontSize: "0.8rem", minWidth: "75px" }}
                >
                  Server Time:
                </Typography>
                <RadioGroup
                  row
                  name="server_time"
                  value={newExam.server_time}
                  onChange={handleChange}
                  sx={{ gap: 0.5 }}
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<span style={{ fontSize: "0.75rem" }}>Yes</span>}
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    value={0}
                    control={<Radio size="small" sx={{ py: 0.25 }} />}
                    label={<span style={{ fontSize: "0.75rem" }}>No</span>}
                    sx={{ m: 0 }}
                  />
                </RadioGroup>
              </Box>
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
                !newExam.duration ||
                !newExam.exam_hall
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
                    question: "",
                    instructions: "",
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
              initialValue=""
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
                  src={`${BASE_URL.replace("/api", "")}/${editQuestionModal.question.file}`}
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
            <Button variant="contained" component="label" color="success">
              <input
                type="file"
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
              color="success"
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
