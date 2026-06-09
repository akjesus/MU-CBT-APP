import { api } from "./api";

export const getStudents = () => {
  const token = localStorage.getItem("token");
  return api.get(`/students`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStudentsForDepartment = (department, level) => {
  const token = localStorage.getItem("token");
  return api.get(`/students/departments/${department}/levels/${level}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createStudent = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/students`,
    {
      first_name: data.first_name,
      last_name: data.last_name,
      other_names: data.other_names,
      email: data.email,
      registration_number: data.registration_number,
      department_id: data.department_id,
      level_id: data.level_id,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateStudent = (data) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/students/${data.id}`,
    {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      registration_number: data.registration_number,
      department_id: data.department_id,
      level_id: data.level_id,
      other_names: data.other_names,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateDepartment = (id, data) => {
  const token = localStorage.getItem("token");
  return api.put(`/students/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getResults = (data) => {
  const token = localStorage.getItem("token");
  return api.get(`${BASE_URL}/results/student`, {
    params: {
      semester: data.semester,
      session: data.session,
      level: data.level,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getProfile = () => {
  const token = localStorage.getItem("token");
  return api.get(`${BASE_URL}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePassword = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `${BASE_URL}/students/change-password`,
    {
      old_password: data.currentPassword,
      new_password: data.newPassword,
      new_password_confirm: data.confirmPassword,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getCurrentGPA = () => {
  const token = localStorage.getItem("token");
  return api.get(`${BASE_URL}/students/gpa`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const resetStudentPassword = (id) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/students/${id}/reset-password`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateProfilePicture = (formData) => {
  const token = localStorage.getItem("token");
  return api.post(`/students/update-picture`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const bulkUploadStudents = (formData) => {
  const token = localStorage.getItem("token");
  return api.post(`/students/bulk-upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStudent = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/students/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const blockUnblockStudent = (id, isBlocked) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/students/${id}/block-unblock`,
    { isBlocked },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
