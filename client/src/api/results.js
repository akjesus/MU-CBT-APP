import {api} from "./api";

export const getResults = (id) => {
  const token = localStorage.getItem("token");
  return api.get(`/result/exam/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamsForCourses = (session_id, course_id) => {
  const token = localStorage.getItem("token");
  return api.get(`/exams/coursesession`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    params: {
      session_id,
      course_id,
    },
  });
};

export const deleteResult = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/result/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getQuestions = (course) => {
  const token = localStorage.getItem("token");
  return api.get(`/questions/course/${course}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllQuestions = () => {
  const token = localStorage.getItem("token");
  return api.get(`/questions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};