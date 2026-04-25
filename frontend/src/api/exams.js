import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";

export const getEligibleExams = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return axios.get(`${BASE_URL}/eligible-exams/student/${user.id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamById = (examId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exams/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllExams = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exams`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getActiveExams = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exams/active`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateExam = (exam) => {
  const token = localStorage.getItem("token");
  return axios.put(
    `${BASE_URL}/exams/${exam.id}`,
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
  return axios.post(
    `${BASE_URL}/exams`,
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
  return axios.delete(`${BASE_URL}/exams/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const toggleExamActive = (id) => {
  const token = localStorage.getItem("token");
  return axios.patch(
    `${BASE_URL}/exams/${id}`,
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
  return axios.get(`${BASE_URL}/exam-questions/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addQuestionsToExam = (exam_id, formData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/questions/${exam_id}/add-to-exam`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteQuestion = (question_id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/questions/${question_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateQuestion = (question_id, formData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${BASE_URL}/questions/${question_id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const submitExam = (studentId, exam_id, responses) => {
  console.log("Submitting exam with responses:", responses);
  const token = localStorage.getItem("token");
  return axios.post(
    `${BASE_URL}/exam-taking/${exam_id}/student/${studentId}/submit`,
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
  return axios.get(
    `${BASE_URL}/exam-taking/${exam_id}/student/${student_id}/eligibility`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const bulkUploadQuestions = (exam_id, formData) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${BASE_URL}/exam-questions/${exam_id}/bulk-upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteAllQuestionsFromExam = (exam_id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/exam-questions/remove/${exam_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/exam-monitoring/create`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${BASE_URL}/exam-monitoring/update`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const endExamMonitoringSession = (activeData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/exam-monitoring/end`, activeData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamSession = (exam_id, matriculation_number) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${BASE_URL}/exam-monitoring/session`,
    { exam_id, matriculation_number },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getStudentsForExam = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(
    `${BASE_URL}/exam-monitoring/${id}/students`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};