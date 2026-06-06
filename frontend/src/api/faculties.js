
import {api} from "./api";


export const getFaculties = () => {
  const token = localStorage.getItem("token");
  return api.get(`/faculties`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCourses = () => {
  const token = localStorage.getItem("token");
  return api.get(`/courses`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSessions = () => {
  const token = localStorage.getItem("token");
  return api.get(`/sessions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLevels = () => {
  const token = localStorage.getItem("token");
  return api.get(`/levels`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createCourse = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/courses`,
    {
      name: data.name,
      code: data.code,
      department_id: data.department,
      level_id: data.level,
      semester_id: data.semester,
      credit_load: data.credit,
      active: data.active,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteCourse = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/courses/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCourse = (data) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/courses/${data.id}`,
    {
      name: data.title,
      code: data.code,
      department_id: data.departmentId,
      level_id: data.levelId,
      semester_id: data.semesterId,
      credit_load: data.credit,
      active: parseInt(data.active),
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
export const getCoursesWithResults = () => {
  const token = localStorage.getItem("token");
  return api.get(`/results/courses`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addFaculty = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/faculties`,
    {
      name: data.name,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};
export const updateFaculty = (id, data) =>
  api.put(`/faculties/${id}`, data);

export const deleteFaculty = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/faculties/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
