import axios from "axios";

// Same origin by default: the API lives at /api on the same deployment.
const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 10000,
});

// Turns any request failure into a message that is safe to show to the user.
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response) {
    if (err.response.status >= 500) return "Server error. Please try again later.";
    return err.response.data?.message || err.response.data?.msg || fallback;
  }
  if (axios.isAxiosError(err)) {
    return err.code === "ECONNABORTED"
      ? "The request timed out. Please try again."
      : "Can't reach the server. Check your connection.";
  }
  return fallback;
};

export default client;
