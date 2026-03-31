import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/admin/dashboard`;

export const getDashboardStats = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};