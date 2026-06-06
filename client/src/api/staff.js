import {api} from "./api";

export const getStaff = () => {
  const token = localStorage.getItem("token");
  return api.get(`/staff`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteStaff = (id) => {
  const token = localStorage.getItem("token");
  return api.delete(`/staff/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const resetPassword = (staffMember) => {
  const token = localStorage.getItem("token");
  return api.patch(
    `/staff/${staffMember.id}`,
    { username: staffMember.username },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const createStaff = (data) => {
  const token = localStorage.getItem("token");
  return api.post(
    `/staff`,
    {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      role: data.role,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const updateStaff = (data, id) => {
  console.log(data);
  const token = localStorage.getItem("token");
  return api.put(
    `/staff/${id}`,
    {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      role: data.role,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

// Placeholder for future view, edit, delete APIs
