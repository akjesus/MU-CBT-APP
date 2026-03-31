// src/api/departments.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL? process.env.REACT_APP_BASE_URL : "http://localhost:5000/api";
const API_URL = `${BASE_URL}/students`;

export const getStudents = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})}

export const getStudentsForDepartment = (department, level) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/departments/${department}/levels/${level}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const createStudent = (data) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        matric: data.matric,
        department: data.department,
        level: data.level,
        username: data.username,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const updateStudent = (data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${data.id}`, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        matric: data.matric,
        department: data.departmentId,
        level: data.levelId,
        username: data.username,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const updateDepartment = (id, data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${id}`, data, {
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})};


export const getResults = ( data) => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/results/student`,
        {
            params: {
                semester: data.semester,
                session: data.session,
                level: data.level
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};

export const getProfile = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/auth/me`,
        {   headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};

export const changePassword = (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${BASE_URL}/students/change-password`,
        {
            old_password: data.currentPassword,
            new_password: data.newPassword,
            new_password_confirm: data.confirmPassword
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};


export const getCurrentGPA = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/students/gpa`,
        {   headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};


export const resetStudentPassword = (id) => {
    const token = localStorage.getItem('token');
    return axios.post(
        `${API_URL}/${id}/reset-password`,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
};

export const updateProfilePicture = (formData) =>  {
const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/update-picture`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
}


export const bulkUploadStudents = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/bulk-upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const deleteStudent = (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const blockUnblockStudent = (id, isBlocked) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${id}/block-unblock`, { isBlocked }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};
