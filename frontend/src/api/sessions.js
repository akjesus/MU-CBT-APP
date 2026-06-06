import {api} from "./api";

export const getSessionsWithSemesters = () => {
  const token = localStorage.getItem("token");
  return api.get(`/schools/sessions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllLevels = () => {
  const token = localStorage.getItem("token");
  return api.get(`/schools/levels`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSemestersForSession = (sessionId) => {
  const token = localStorage.getItem("token");
  return api.get(`/schools/sessions/${sessionId}/semesters`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const setActiveSemester = (semesterId) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/schools/semesters/${semesterId}/activate`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteSession = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(
    `/sessions/${id}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateSession = (data) => {
  const token = localStorage.getItem("token");
  return api.put(
    `/sessions/${data.id}`,
    { name: data.name, start_date: data.start_date, end_date: data.end_date },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export const createSession = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/sessions`,
    { name: data.name, start_date: data.start_date, end_date: data.end_date },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
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
