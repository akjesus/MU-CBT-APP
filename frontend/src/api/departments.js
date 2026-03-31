// src/api/departments.js
import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/departments`;


export const getDepartments = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};
export const addDepartment = (data) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, {
        name: data.name, faculty_id: data.school
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
};
export const updateDepartment = (id, data) => axios.put(`${API_URL}/${id}`, data);

export const deleteDepartment = (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/${id}`, {
        headers : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}
