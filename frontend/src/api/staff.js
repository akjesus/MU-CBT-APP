import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/staff`;

export const getStaff = () => {
  const token = localStorage.getItem('token');
  return axios.get(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const deleteStaff = (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const resetPassword = (id) => {
  const token = localStorage.getItem('token');
  return axios.patch(`${API_URL}/${id}`, {}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const createStaff = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}`, {
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    role: data.role,

  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};


export const updateStaff = (data, id) => {
    console.log(data)
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/${id}`, {
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    role: data.role,

  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Placeholder for future view, edit, delete APIs
