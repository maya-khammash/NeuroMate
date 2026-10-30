import API from "../services/api";

export const getAllData = async () => {
  const res = await API.get("/admin/all-data");
  return res.data;
};

export const deleteUser = async (userId) => {
  await API.delete(`/admin/user/${userId}`);
};

export const addUser = async (userData) => {
  const res = await API.post("/admin/user", userData);
  return res.data;
};
