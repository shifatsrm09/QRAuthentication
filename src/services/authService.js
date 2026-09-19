import client from "./client";

export const signup = async (name, email, password) => {
  const { data } = await client.post("/auth/signup", { name, email, password });
  return data;
};

export const login = async (email, password) => {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
};
