const API_BASE_URL = "http://localhost:5000/api";
const departmentCodes = {
  "Computer Science": "CS",
  "Software Engineering": "SE",
  "Artificial Intelligence": "AI",
  "Business Administration": "BBA",
  "Electrical Engineering": "EE",
};

const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("user_role");
  window.dispatchEvent(new CustomEvent("portal:logout"));
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = localStorage.getItem("auth_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Could not reach the server. Is the backend running?");
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 401 && !options.skipAuth) {
    logout();
  }
  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body;
};

const saveSession = (data) => {
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("auth_user", JSON.stringify(data.user));
  localStorage.setItem("user_role", data.user.role);
};

const ApiService = {
  get user() {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  },
  hasSession() {
    return Boolean(localStorage.getItem("auth_token") && this.user);
  },
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    saveSession(data);
    return data;
  },
  logout,
  getDashboard: () => request("/admin/dashboard"),
  getCharts: () => request("/admin/charts"),
  getStudents: (search = "", department = "") =>
    request(`/students?search=${encodeURIComponent(search)}&department=${encodeURIComponent(departmentCodes[department] || department)}`),
  addStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
  getFacultyCourses: () => request("/faculty/courses"),
  getCourseStudents: (courseId) => request(`/faculty/courses/${courseId}/students`),
  markAttendance: (data) => request("/attendance", { method: "POST", body: JSON.stringify(data) }),
  getFacultySchedule: () => request("/faculty/schedule"),
  getStudentOverview: () => request("/student/overview"),
  getStudentCourses: () => request("/student/courses"),
  getStudentAttendance: () => request("/student/attendance"),
  getGpaHistory: () => request("/student/gpa-history"),
  getFeeVoucher: () => request("/student/fee-voucher"),
  getTimetable: () => request("/timetable"),
  addTimetable: (data) => request("/timetable", { method: "POST", body: JSON.stringify(data) }),
  getNotices: () => request("/notices"),
  publishNotice: (data) => request("/notices", { method: "POST", body: JSON.stringify(data) }),
};
