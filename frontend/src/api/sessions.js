import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";


export const getSessionsWithSemesters = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/schools/sessions`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getAllLevels = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/schools/levels`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};  

export const getSemestersForSession = (sessionId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${BASE_URL}/schools/sessions/${sessionId}/semesters`, {
    headers: {
      'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };
  
  export const setActiveSemester = (semesterId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${BASE_URL}/schools/semesters/${semesterId}/activate`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };