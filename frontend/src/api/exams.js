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

export const getAllExams = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exams`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateExam = (exam) => {
  const token = localStorage.getItem("token");
  return axios.put(`${BASE_URL}/exams/${exam.id}`, {
    exam
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createExam = (exam) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/exams`, {
    exam
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteExam = (examId) => { 
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/exams/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export const toggleExamActive = (id) => {
  const token = localStorage.getItem("token");
  return axios.patch(`${BASE_URL}/exams/${id}`, {}, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
} 

export const getQuestionsForExam = (examId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exam-questions/${examId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export const addQuestionsToExam = (exam_id, course_id, question) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_URL}/questions/${exam_id}/add-to-exam`, {
    course_id, question
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
} 

export const deleteQuestion = (question_id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/questions/${question_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}