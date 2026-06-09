import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Timer,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import {
  getQuestionsForExam,
  getExamById,
  submitExam,
  isEligilbe,
  createExamMonitoringSession,
  updateExamMonitoringSession,
  endExamMonitoringSession,
  getExamSession,
  markAttendance,
  signAttendance,
} from "../../api/exams";
import parse from "html-react-parser";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const user = JSON.parse(localStorage.getItem("user"));


export default function StudentExam() {
  const { exam_id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Storage keys
  const responsesKey = `exam_${exam_id}_responses`;
  const timeLeftKey = `exam_${exam_id}_timeLeft`;

  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [examEnded, setExamEnded] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [autoSubmitModalOpen, setAutoSubmitModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
const examEndedRef = useRef(false);
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Prevent navigation and shortcuts
  const preventNavigation = useCallback((e) => {
    if (
      e.key === "F5" ||
      (e.ctrlKey && e.key === "r") ||
      (e.ctrlKey && e.shiftKey && e.key === "R") ||
      (e.altKey && e.key === "ArrowLeft") || // Back
      (e.altKey && e.key === "ArrowRight") // Forward
    ) {
      e.preventDefault();
      showSnackbar("Navigation blocked during exam", "warning");
      return false;
    }
  }, []);

  const eligibilityCheck = async () => {
    try {
      const eligibilityRes = await isEligilbe(exam_id, user.id);
      if (eligibilityRes.data.code === 304) {
        setLoading(false);
        return false;
      }
    } catch (error) {
      showSnackbar("Not eligible for this exam", "error");
      return false;
    }

    return true;
  };

  const [isEligible, setIsEligible] = useState(false);
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const res = await eligibilityCheck();
        if (res === false) {
          setIsEligible(false);
          return;
        } else {
          setIsEligible(true);
          const examRes = await getExamById(exam_id);
          const examData = examRes.data;
          setExamInfo(examData);
          markAttendance(exam_id, user.id);
          const session = await getExamSession(user.id, exam_id);
          if (session.data.success) {
            const resume = window.confirm(
              "An active exam session was found. Do you want to resume?",
            );
            if (resume) {
              if (session.data.session.responses) {
                localStorage.setItem(
                  responsesKey,
                  JSON.stringify(session.data.session.responses),
                );
              }
              if (session.data.session.time_left !== undefined) {
                localStorage.setItem(
                  timeLeftKey,
                  session.data.session.time_left.toString(),
                );
              }
            }
          }

          // Get questions
          const questionsRes = await getQuestionsForExam(exam_id);
          setQuestions(questionsRes.data);

          if (examData.duration) {
            let initialTime = examData.duration * 60;
            const savedTime = localStorage.getItem(timeLeftKey);
            if (savedTime) {
              initialTime = Math.min(initialTime, parseInt(savedTime, 10));
            }
            setTimeLeft(initialTime);
          }

          const savedResponses = localStorage.getItem(responsesKey);
          if (savedResponses) {
            setResponses(JSON.parse(savedResponses));
          }
          const activeData = {
            student_id: user.id,
            exam_id: exam_id,
            responses: JSON.parse(localStorage.getItem(responsesKey)) || {},
            time_left: examData.duration * 60,
            answered_questions: `0 / ${questionsRes.data.length}`,
          };
          await createExamMonitoringSession(activeData);
          console.log("Exam Session created on exam start!");
        }
      } catch (error) {
        showSnackbar("Error loading exam: " + error.message, "error");
        setTimeout(() => navigate("/student/dashboard"), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [exam_id, navigate]);

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(responsesKey, JSON.stringify(responses));
    }
  }, [responses, responsesKey]);

  // Save timeLeft to localStorage
  useEffect(() => {
    if (timeLeft !== null) {
      localStorage.setItem(timeLeftKey, timeLeft.toString());
    }
  }, [timeLeft, timeLeftKey]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setAutoSubmitModalOpen(true);
          handleSubmitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Prevent navigation on exam
  useEffect(() => {
    if (!examInfo) return;
    document.addEventListener("keydown", preventNavigation);
    return () => {
      document.removeEventListener("keydown", preventNavigation);
    };
  }, [examInfo, preventNavigation]);

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle response selection
  const handleSelectOption = (questionId, option) => {
    setResponses({
      ...responses,
      [questionId]: option,
    });
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOpenConfirm = () => {
    if (submitting) return;
    setOpenConfirm(true);
  };

  // Handle submit exam
  const handleSubmitExam = async () => {
    if (submitting) {
      console.log("Submit already in progress");
      return;
    }

    if (!user || !user.id) {
      showSnackbar("User not authenticated. Please log in again.", "error");
      return;
    }

    try {
      setSubmitting(true);
      console.log("Submitting exam", {
        exam_id,
        studentId: user.id,
        responses,
      });

      // Format responses as object with question_id: option
      const formattedResponses = {};
      questions.forEach((q) => {
        if (responses[q.question_id]) {
          formattedResponses[q.question_id] = responses[q.question_id];
        }
      });
      const submitRes = await submitExam(user.id, exam_id, formattedResponses);
      console.log("Submit response:", submitRes.data);
      showSnackbar(`Exam submitted successfully!`, "success");
      localStorage.setItem(
        "examResult",
        JSON.stringify({
          examName: examInfo?.exam_name,
          courseName: examInfo?.course_name,
          timestamp: new Date().toISOString(),
        }),
      );
      // Clear saved data
      localStorage.removeItem(responsesKey);
      localStorage.removeItem(timeLeftKey);
      signAttendance(exam_id, user.id);
      endExamSession();
      setTimeout(() => navigate("/student/dashboard"), 2000);
    } catch (error) {
      showSnackbar(
        "Error submitting exam: " +
          (error.response?.data?.error || error.message),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateExamSession = async () => {
    try {
      const activeData = {
        student_id: user.id,
        exam_id: exam_id,
        responses: JSON.parse(localStorage.getItem(responsesKey)),
        time_left: localStorage.getItem(timeLeftKey),
        answered_questions: `${Object.keys(JSON.parse(localStorage.getItem(responsesKey)) || {}).length} / ${questions.length}`,
      };
      await updateExamMonitoringSession(activeData);
      console.log("Exam Session updated!");
      return true;
    } catch (error) {
      console.error("Error updating exam session:", error);
      return false;
    }
  };

  const endExamSession = async () => {
    try {
      await endExamMonitoringSession({
        student_id: user.id,
        matriculation_number: user.matriculation_number,
        exam_id: exam_id,
      });
      console.log("Exam Session ended!");
    } catch (error) {
      console.error("Error ending exam session:", error);
    }
  };

  const checkExamStatus = async () => {
    try {
      const res = await getExamSession(user.id, exam_id);
      if (res.data.session.status === "submitted" && !examEndedRef.current) {
        setExamEnded(true);
        return;
      }
      console.log(res.data.session.status);
    } catch (error) {
      console.error("Error checking exam status:", error);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateExamSession();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let intervalId;
    const checker = async () => {
      try {
        if (examEnded) {
           examEndedRef.current = true;
           clearInterval(intervalId);
           await updateExamSession();
          localStorage.removeItem(responsesKey);
          localStorage.removeItem(timeLeftKey);
          signAttendance(exam_id, user.id);
          showSnackbar(
            "Exam has been ended by the administrator. Your answers have been submitted.",
            "info",
          );
          setTimeout(() => navigate("/student/dashboard"), 2000);
        }
      } catch (err) {
        console.log("Status check failed", err);
      }
    };
    intervalId = setInterval(checker, 5000);
    return () => clearInterval(intervalId);
  }, [examEnded]);

  useEffect(() => {
    const checker = setInterval(checkExamStatus, 5000);
    return () => clearInterval(checker);
  }, []);
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography>Loading exam...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Container>
    );
  }
  if (!isEligible) {
    setTimeout(() => navigate("/student/dashboard"), 3000);
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">You have already taken this exam!</Typography>
        <Button onClick={() => navigate("/student/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">No questions found for this exam.</Typography>
        <Button onClick={() => navigate("/student/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (Object.keys(responses).length / questions.length) * 100;

  const renderQuestion = (question) => {
    if (question.question_type === "Theory") {
      return <div>{parse(question.text)}</div>;
    }
    return <div>{question.text}</div>;
  };

  // Enable fullscreen mode when exam starts
  const enableFullScreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  };

  return (
    <Container sx={{ py: 1 }}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 1 }}>
          <Box
            sx={{
              position: "fixed",
              top: 10,
              left: 10,
              zIndex: 10000,
              backgroundColor: "#f5f5f5",
              padding: "8px 8px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {user?.first_name} {user?.other_names} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Matric No: {user?.matriculation_number}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Department: {user?.department}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Level: {user?.level}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography>
              {examInfo?.exam_name}: {examInfo?.course_name}{" "}
            </Typography>
            <Box
              sx={{
                textAlign: "center",
                backgroundColor:
                  timeLeft && timeLeft < 300 ? "#ffebee" : "#f5f5f5",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Timer
                  sx={{
                    color: timeLeft < 300 ? "error.main" : "inherit",
                    fontSize: "1.5rem",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: timeLeft < 300 ? "error.main" : "inherit",
                    fontSize: "1.5rem",
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              maxWidth: 500,
              mx: "auto",
              mb: 1,
            }}
          >
            <Typography variant="body2">
              Answered: {Object.keys(responses).length} of {questions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <LinearProgress
              variant="determinate"
              color="success"
              value={progress}
              sx={{
                flex: 1,
                maxWidth: 500,
                mx: "auto",
                height: 10,
                borderRadius: 5,
              }}
            />
          </Box>
          <Card
            sx={{
              backgroundColor: "#fafafa",
              maxWidth: 1000,
              mx: "auto",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              {currentQuestion.instructions && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#e3f2fd",
                    borderLeft: "4px solid #2196f3",
                  }}
                >
                  <Typography variant="body2" color="primary">
                    <strong>Instructions:</strong>{" "}
                    {currentQuestion.instructions}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Question {currentQuestionIndex + 1}:
                {renderQuestion(currentQuestion)}
              </Typography>

              {/* Question Image/File if exists */}
              {currentQuestion.file && (
                <Box>
                  <img
                    src={`${BASE_URL.replace("/api", "")}/${currentQuestion.file}`}
                    alt={`Question Image: ${currentQuestion.file}`}
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                </Box>
              )}

              {currentQuestion.question_type === "Objective" && (
                <RadioGroup
                  value={responses[currentQuestion.question_id] || ""}
                  onChange={(e) =>
                    handleSelectOption(
                      currentQuestion.question_id,
                      e.target.value,
                    )
                  }
                >
                  {["option_a", "option_b", "option_c", "option_d"].map(
                    (option, index) => {
                      const label = String.fromCharCode(65 + index);
                      const optionText = currentQuestion[option];

                      if (!optionText) return null;

                      const isSelected =
                        responses[currentQuestion.question_id] === label;

                      return (
                        <Box
                          key={option}
                          onClick={() =>
                            handleSelectOption(
                              currentQuestion.question_id,
                              label,
                            )
                          }
                          sx={{
                            mb: 0.5,
                            p: 1.5,
                            border: "2px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: isSelected ? "#e8f5e9" : "#fff",
                            borderColor: isSelected ? "#4caf50" : "#e0e0e0",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#4caf50",
                              boxShadow: "0 2px 8px rgba(76,175,80,0.1)",
                            },
                          }}
                        >
                          <FormControlLabel
                            value={label}
                            control={
                              <Radio
                                checked={isSelected}
                                onChange={() =>
                                  handleSelectOption(
                                    currentQuestion.question_id,
                                    label,
                                  )
                                }
                                sx={{ display: "none" }}
                              />
                            }
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                  gap: 1,
                                }}
                              >
                                {isSelected ? (
                                  <RadioButtonChecked
                                    sx={{ color: "#4caf50" }}
                                  />
                                ) : (
                                  <RadioButtonUnchecked
                                    sx={{ color: "#9e9e9e" }}
                                  />
                                )}
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  <strong>{label}.</strong> {optionText}
                                </Typography>
                              </Box>
                            }
                            sx={{ width: "100%", margin: 0 }}
                          />
                        </Box>
                      );
                    },
                  )}
                </RadioGroup>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: "flex", gap: 1, mb: 1, mt: 3 }}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  startIcon={<NavigateBefore />}
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  fullWidth
                >
                  Previous Question
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  fullWidth
                >
                  Next Question
                </Button>
              </Box>

              <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {questions.map((q, index) => {
                    const isCurrentQuestion = index === currentQuestionIndex;
                    const isAnsweredQuestion = responses[q.question_id];

                    return (
                      <Button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        variant={isCurrentQuestion ? "contained" : "outlined"}
                        size="small"
                        sx={{
                          minWidth: "40px",
                          width: "40px",
                          height: "40px",
                          p: 0,
                          backgroundColor: isCurrentQuestion
                            ? "#1d3dda"
                            : undefined,
                          color:
                            !isAnsweredQuestion && !isCurrentQuestion
                              ? "inherit"
                              : undefined,
                        }}
                      >
                        {isAnsweredQuestion &&
                        !isCurrentQuestion &&
                        isAnsweredQuestion && !isCurrentQuestion ? (
                          <Stack>
                            <CheckCircle
                              sx={{ fontSize: "28px" }}
                              color="success"
                            />
                          </Stack>
                        ) : (
                          index + 1
                        )}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Grid>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to submit now? You cannot change your answers
            after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpenConfirm(false);
              handleSubmitExam();
            }}
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={autoSubmitModalOpen}
        onClose={() => setAutoSubmitModalOpen(false)}
      >
        <DialogTitle>Time's Up!</DialogTitle>
        <DialogContent>
          <Typography>
            Your time for this exam has expired. The exam will be submitted
            automatically.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

      {/* Submit Exam Button - Always Visible */}
      <Button
        variant="contained"
        color="error"
        onClick={handleOpenConfirm}
        disabled={submitting}
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 10000,
        }}
      >
        Submit Exam
      </Button>
    </Container>
  );
}
