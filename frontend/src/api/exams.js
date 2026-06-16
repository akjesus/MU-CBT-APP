import { api } from "./api";

export const getEligibleExams = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return api.get(`/eligible-exams/student/${user.id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamById = (examId) => {
  const token = localStorage.getItem("token");
  return api.get(`/exams/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllExams = () => {
  const token = localStorage.getItem("token");
  return api.get(`/exams`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getActiveExams = () => {
  const token = localStorage.getItem("token");
  return api.get(`/exams/active`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateExam = (exam) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/exams/${exam.id}`,
    {
      exam,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const createExam = (exam) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/exams`,
    {
      exam,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteExam = (examId) => {
  const token = localStorage.getItem("token");
  return api.delete(`/exams/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const toggleExamActive = (id) => {
  const token = localStorage.getItem("token");
  return api.patch(
    `/exams/${id}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getQuestionsForExam = (examId) => {
  const token = localStorage.getItem("token");
  return api.get(`/exam-questions/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addQuestionsToExam = (exam_id, formData) => {
  const token = localStorage.getItem("token");
  return api.post(`/questions/${exam_id}/add-to-exam`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteQuestion = (question_id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/questions/${question_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateQuestion = (question_id, formData) => {
  const token = localStorage.getItem("token");
  return api.put(`/questions/${question_id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const submitExam = (studentId, exam_id, responses) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/exam-taking/${exam_id}/student/${studentId}/submit`,
    {
      responses,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const isEligilbe = (exam_id, student_id) => {
  const token = localStorage.getItem("token");
  return api.get(`/exam-taking/${exam_id}/student/${student_id}/eligibility`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const bulkUploadQuestions = (exam_id, formData) => {
  const token = localStorage.getItem("token");
  return api.post(`/exam-questions/${exam_id}/bulk-upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteAllQuestionsFromExam = (exam_id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/exam-questions/remove/${exam_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return api.post(`/exam-monitoring/create`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return api.put(`/exam-monitoring/update`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const endExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return api.post(`/exam-monitoring/end`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamSession = (student_id, exam_id) => {
  const token = localStorage.getItem("token");
  return api.get(`/exam-monitoring/session`, {
    params: { exam_id, student_id },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStudentsForExam = (id) => {
  const token = localStorage.getItem("token");
  return api.get(`/exam-monitoring/${id}/students`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const markAttendance = (exam_id, student_id) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/attendance`,
    { exam_id, student_id },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
export const getAttendance = (attendanceField) => {
  const token = localStorage.getItem("token");
  return api.get(
    `/attendance`,
    {
      params: attendanceField,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
export const getTodaysAttendance = () => {
  const token = localStorage.getItem("token");
  return api.get(
    `/attendance/today`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const signAttendance = (exam_id, student_id) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/attendance`,
    { exam_id, student_id },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const endExam = (examId) => {
  const token = localStorage.getItem("token");
  return api.post(`/exam-taking/${examId}/end`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
