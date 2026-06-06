import {api} from "./api"

export const getDepartments = () => {
    const token = localStorage.getItem('token');
    return api.get(`/departments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
};

export const addDepartment = (data) => {
    const token = localStorage.getItem('token');
    return api.post(
      `/departments`,
      {
        name: data.name,
        faculty_id: data.school,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
};
export const updateDepartment = (id, data) => api.put(`/ departments/${id}`, data);

export const deleteDepartment = (id) => {
    const token = localStorage.getItem('token');
    return api.delete(` / departments/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
}
