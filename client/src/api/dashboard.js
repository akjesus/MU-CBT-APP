import { api } from "./api";

export const getDashboardStats = () => {
  const token = localStorage.getItem("token");
  return api.get(`/admin/dashboard`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
