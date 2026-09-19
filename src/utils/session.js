// Client-side session helpers. The server is the real authority on whether a
// token is valid; these checks only decide what the UI shows.

const TOKEN_KEY = "token";
const USER_KEY = "user";

// localStorage can throw (private mode, blocked storage), so never touch it bare.
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the session just won't persist */
  }
};
const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

// Reads the payload of a JWT without verifying it.
const decodePayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenUsable = (token) => {
  if (typeof token !== "string") return false;
  const payload = decodePayload(token);
  if (!payload) return false;
  return payload.exp ? payload.exp * 1000 > Date.now() : true;
};

export const saveSession = (token, user) => {
  write(TOKEN_KEY, token);
  write(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  remove(TOKEN_KEY);
  remove(USER_KEY);
};

export const getUser = () => {
  try {
    return JSON.parse(read(USER_KEY) || "null");
  } catch {
    return null;
  }
};

// True when a non-expired token is stored. Stale tokens are cleaned up here.
export const hasValidSession = () => {
  const token = read(TOKEN_KEY);
  if (!token) return false;
  if (isTokenUsable(token)) return true;
  clearSession();
  return false;
};
