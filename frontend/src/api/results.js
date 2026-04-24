import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL

export const getResults = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/result/exam/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getExamsForCourses = (session_id, course_id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/exams/coursesession`, {
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
  return axios.delete(`${BASE_URL}/result/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}