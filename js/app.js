let currentRole = null;
let currentTab = null;
let attendanceState = {};
let attendanceCourse = null;
let attendanceStudents = [];

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character]));

const showPanelMessage = (container, message, type = "info") => {
  if (!container) return;
  container.innerHTML = `<div class="p-4 rounded-xl ${type === "error" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500"} text-xs font-semibold">${escapeHtml(message)}</div>`;
};

const setLoading = (container) => showPanelMessage(container, "Loading...");

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupRoleSwitcher();
  setupSearchAndFilters();
  setupModals();
  setupDarkMode();
  setupLogout();
  window.addEventListener("portal:logout", showLoginScreen);
  if (ApiService.hasSession()) {
    applySession(ApiService.user);
  } else {
    showLoginScreen();
  }
});

function showLoginScreen() {
  currentRole = null;
  document.getElementById("role-banner").style.display = "none";
  document.getElementById("sidebar").style.display = "none";
  document.querySelector("main").style.display = "none";

  let login = document.getElementById("portal-login");
  if (!login) {
    login = document.createElement("div");
    login.id = "portal-login";
    login.className = "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4";
    login.innerHTML = `
      <form id="portal-login-form" class="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl mb-5">A</div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">Apex University Portal</h1>
        <p class="text-xs text-slate-500 mt-1 mb-6">Sign in to continue</p>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
        <input id="login-email" type="email" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mb-4">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
        <input id="login-password" type="password" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mb-4">
        <div id="login-error" class="hidden text-xs font-semibold text-rose-600 mb-4"></div>
        <button class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black">Sign In</button>
      </form>`;
    document.body.appendChild(login);
    login.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = document.getElementById("login-error");
      error.classList.add("hidden");
      try {
        const data = await ApiService.login(
          document.getElementById("login-email").value,
          document.getElementById("login-password").value,
        );
        login.remove();
        applySession(data.user);
      } catch (loginError) {
        error.textContent = loginError.message;
        error.classList.remove("hidden");
      }
    });
  }
  login.style.display = "flex";
}

function applySession(user) {
  currentRole = user.role;
  document.getElementById("portal-login")?.remove();
  document.getElementById("role-banner").style.display = "";
  document.getElementById("sidebar").style.display = "";
  document.querySelector("main").style.display = "";
  document.querySelectorAll(".role-indicator").forEach((item) => { item.textContent = user.role.toUpperCase(); });
  document.querySelectorAll(".user-name-label").forEach((item) => { item.textContent = user.name; });
  document.querySelectorAll(".user-role-label").forEach((item) => { item.textContent = `${user.role[0].toUpperCase()}${user.role.slice(1)} Portal`; });
  document.querySelectorAll("[data-role-switch]").forEach((button) => {
    button.style.display = button.dataset.roleSwitch === user.role ? "" : "none";
  });
  document.getElementById("nav-admin-group").style.display = user.role === "admin" ? "block" : "none";
  document.getElementById("nav-faculty-group").style.display = user.role === "faculty" ? "block" : "none";
  document.getElementById("nav-student-group").style.display = user.role === "student" ? "block" : "none";
  const defaultTabs = { admin: "admin-dashboard", faculty: "faculty-dashboard", student: "student-dashboard" };
  switchTab(defaultTabs[user.role]);
}

function setupLogout() {
  const footer = document.querySelector("#sidebar .border-t");
  if (!footer || footer.querySelector("#logout-button")) return;
  const button = document.createElement("button");
  button.id = "logout-button";
  button.className = "w-full mt-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800";
  button.textContent = "Logout";
  button.addEventListener("click", ApiService.logout);
  footer.appendChild(button);
}

function switchRole(role) {
  if (role !== currentRole) return;
  switchTab({ admin: "admin-dashboard", faculty: "faculty-dashboard", student: "student-dashboard" }[role]);
}

function switchTab(tabId) {
  const allowed = tabId.startsWith(`${currentRole}-`);
  if (!allowed) return;
  currentTab = tabId;
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.add("hidden"));
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("animate-fade-in");
  }
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("bg-blue-50", link.dataset.tab === tabId);
    link.classList.toggle("text-blue-600", link.dataset.tab === tabId);
  });
  renderTabData(tabId);
  closeMobileSidebar();
}

function setupNavigation() {
  document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    switchTab(link.dataset.tab);
  }));
}

function setupRoleSwitcher() {
  document.querySelectorAll("[data-role-switch]").forEach((button) => button.addEventListener("click", () => switchRole(button.dataset.roleSwitch)));
}

async function renderTabData(tabId) {
  try {
    if (tabId === "admin-dashboard") await renderAdminDashboard();
    else if (tabId === "admin-students") await loadStudents();
    else if (tabId === "admin-faculty" || tabId === "admin-departments" || tabId === "faculty-grades" || tabId === "student-admitcard") {
      showUnavailable(tabId);
    } else if (tabId === "admin-timetable" || tabId === "student-timetable") await renderTimetableGrid(tabId === "student-timetable" ? "student-timetable-container" : "admin-timetable-container");
    else if (tabId.includes("notices")) await renderNoticesList();
    else if (tabId === "faculty-dashboard") await renderFacultyOverview();
    else if (tabId === "faculty-attendance") await initAttendanceMarker();
    else if (tabId === "student-dashboard") await renderStudentDashboard();
    else if (tabId === "student-courses") await renderStudentCourses();
    else if (tabId === "student-attendance") await renderStudentAttendanceDetails();
    else if (tabId === "student-challan") await renderFeeChallan();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function renderAdminDashboard() {
  const data = await ApiService.getDashboard();
  const cards = document.querySelectorAll("#admin-dashboard .grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 h4");
  [data.totalStudents, data.totalFaculty, `${data.feeCollectionRate}%`, `${data.averageAttendance}%`].forEach((value, index) => {
    if (cards[index]) cards[index].textContent = value;
  });
  const cardNotes = document.querySelectorAll("#admin-dashboard .grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 p:last-child");
  ["Live backend count", "Live backend count", "Paid vouchers / all vouchers", "Present + late records"].forEach((value, index) => {
    if (cardNotes[index]) cardNotes[index].textContent = value;
  });
  setTimeout(initAdminCharts, 50);
  await Promise.all([renderRecentStudentsList(), renderRecentNoticesMini()]);
}

function renderStudentsTable(list) {
  const tbody = document.getElementById("students-table-body");
  if (!tbody) return;
  document.getElementById("students-count-badge").textContent = `${list.length} Students`;
  tbody.innerHTML = list.map((student) => `
    <tr class="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition text-xs">
      <td class="py-3.5 px-4 font-mono font-bold text-blue-600">${escapeHtml(student.rollNo)}</td>
      <td class="py-3.5 px-4"><div class="font-bold text-slate-800 dark:text-white text-sm">${escapeHtml(student.name)}</div><div class="text-[11px] text-slate-400 font-mono">${escapeHtml(student.email || "—")}</div></td>
      <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">${escapeHtml(student.department)}</td>
      <td class="py-3.5 px-4 text-center font-bold">${student.semester}</td>
      <td class="py-3.5 px-4 text-center"><span class="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold font-mono">${Number(student.cgpa).toFixed(2)}</span></td>
      <td class="py-3.5 px-4 text-center text-slate-400">—</td><td class="py-3.5 px-4 text-center text-slate-400">—</td>
      <td class="py-3.5 px-4 text-right"><button onclick="viewStudentProfile('${student.id}')" class="px-2.5 py-1 text-xs font-semibold bg-slate-100 rounded-lg">View</button></td>
    </tr>`).join("");
}

async function loadStudents() {
  const tbody = document.getElementById("students-table-body");
  setLoading(tbody);
  const department = document.getElementById("student-dept-filter")?.value || "";
  const search = document.getElementById("student-search-input")?.value || "";
  const students = await ApiService.getStudents(search, department === "All" ? "" : department);
  renderStudentsTable(students);
}

async function renderFacultyOverview() {
  const courses = await ApiService.getFacultyCourses();
  const section = document.getElementById("faculty-dashboard");
  const cards = section.querySelectorAll(".grid.grid-cols-1.md\\:grid-cols-2 > div");
  courses.forEach((course, index) => {
    if (!cards[index]) return;
    cards[index].querySelector("span").textContent = course.code;
    cards[index].querySelector("h5").textContent = course.title;
    cards[index].querySelector("p").textContent = `${course.enrolledStudents} Students enrolled • ${course.creditHours} credit hours`;
    cards[index].querySelector("button").dataset.courseId = course._id;
  });
}

async function initAttendanceMarker() {
  const container = document.getElementById("attendance-marking-list");
  setLoading(container);
  const courses = await ApiService.getFacultyCourses();
  attendanceCourse = courses.find((course) => course._id === attendanceCourse?._id) || courses[0];
  if (!attendanceCourse) {
    showPanelMessage(container, "No courses are assigned to this faculty member.");
    return;
  }
  attendanceStudents = await ApiService.getCourseStudents(attendanceCourse._id);
  attendanceStudents.forEach((student) => { attendanceState[student.studentId] ||= "present"; });
  container.innerHTML = `
    <select id="attendance-course-select" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold mb-3">
      ${courses.map((course) => `<option value="${course._id}" ${course._id === attendanceCourse._id ? "selected" : ""}>${escapeHtml(course.code)} — ${escapeHtml(course.title)}</option>`).join("")}
    </select>
    ${attendanceStudents.map((student) => attendanceRow(student)).join("")}`;
  document.getElementById("attendance-course-select").addEventListener("change", async (event) => {
    attendanceCourse = courses.find((course) => course._id === event.target.value);
    attendanceStudents = await ApiService.getCourseStudents(attendanceCourse._id);
    attendanceStudents.forEach((student) => { attendanceState[student.studentId] ||= "present"; });
    initAttendanceMarker();
  });
}

function attendanceRow(student) {
  const status = attendanceState[student.studentId] || "present";
  return `<div class="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 gap-3">
    <div><div class="text-sm font-bold">${escapeHtml(student.name)}</div><div class="text-xs text-slate-500 font-mono">${escapeHtml(student.rollNo)}</div></div>
    <div class="flex space-x-2">${["present", "absent", "late"].map((item) => `<button onclick="setStudentAttendance('${student.studentId}','${item}')" class="px-3 py-1.5 text-xs font-bold rounded-lg ${status === item ? (item === "present" ? "bg-emerald-600 text-white" : item === "absent" ? "bg-rose-600 text-white" : "bg-amber-500 text-white") : "bg-slate-100 dark:bg-slate-700"}">${item[0].toUpperCase() + item.slice(1)}</button>`).join("")}</div>
  </div>`;
}

function setStudentAttendance(studentId, status) {
  attendanceState[studentId] = status;
  document.getElementById("attendance-marking-list").querySelectorAll(".flex.items-center.justify-between").forEach((row, index) => {
    if (attendanceStudents[index]?.studentId === studentId) row.outerHTML = attendanceRow(attendanceStudents[index]);
  });
}

async function saveFacultyAttendance() {
  if (!attendanceCourse) return;
  try {
    const result = await ApiService.markAttendance({
      courseId: attendanceCourse._id,
      date: new Date().toISOString().slice(0, 10),
      records: attendanceStudents.map((student) => ({ studentId: student.studentId, status: attendanceState[student.studentId] || "present" })),
    });
    showToast(`Attendance saved: ${result.saved} records`, "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function renderTimetableGrid(containerId = "admin-timetable-container") {
  const container = document.getElementById(containerId);
  setLoading(container);
  const slots = await ApiService.getTimetable();
  if (!slots.length) return showPanelMessage(container, "No timetable slots found.");
  container.innerHTML = slots.map((slot) => `<div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 card-shadow">
    <div class="flex justify-between"><span class="font-mono text-xs font-bold text-blue-600">${escapeHtml(slot.course.code)}</span><span class="text-xs font-bold text-blue-600">${escapeHtml(slot.day)}</span></div>
    <h4 class="font-extrabold text-slate-900 dark:text-white mt-3">${escapeHtml(slot.course.title)}</h4>
    <p class="text-xs text-slate-500 mt-2">${escapeHtml(slot.startTime)} • ${escapeHtml(slot.lectureHall)}</p>
  </div>`).join("");
}

async function renderNoticesList() {
  const notices = await ApiService.getNotices();
  ["admin-notices-list", "faculty-notices-list", "student-notices-list", "recent-notices-mini"].forEach((id) => {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = notices.map((notice) => `<div class="p-4 rounded-xl border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 mb-3">
      <div class="flex justify-between text-xs text-slate-400"><span class="font-bold text-blue-600">${escapeHtml(notice.priority)}</span><span>${new Date(notice.date).toLocaleDateString()}</span></div>
      <div class="font-bold text-slate-800 dark:text-white mt-1">${escapeHtml(notice.title)}</div><div class="text-xs text-slate-500 mt-1">${escapeHtml(notice.message)}</div>
    </div>`).join("");
  });
}

async function renderStudentDashboard() {
  const [overview, fee] = await Promise.all([ApiService.getStudentOverview(), ApiService.getFeeVoucher()]);
  const section = document.getElementById("student-dashboard");
  section.querySelector("h3").textContent = `Welcome, ${overview.name}!`;
  section.querySelector("h3").nextElementSibling.textContent = `Roll: ${overview.rollNo} • ${overview.department} (${overview.semester}th Semester)`;
  const cards = section.querySelectorAll(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 h4");
  [overview.cgpa, `${overview.attendancePercentage}%`, `${overview.totalCreditHours} Cr.`, fee.status.toUpperCase()].forEach((value, index) => { if (cards[index]) cards[index].textContent = value; });
  const notes = section.querySelectorAll(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 p:last-child");
  ["From student profile", "Present + late counted attended", "From enrolled courses", "Latest fee voucher"].forEach((value, index) => { if (notes[index]) notes[index].textContent = value; });
  setTimeout(initStudentCharts, 50);
  await renderStudentUpcomingClasses();
}

async function renderStudentCourses() {
  const container = document.getElementById("student-courses-grid");
  setLoading(container);
  const [courses, attendance] = await Promise.all([ApiService.getStudentCourses(), ApiService.getStudentAttendance()]);
  const attendanceMap = Object.fromEntries(attendance.courses.map((item) => [item.code, item]));
  container.innerHTML = courses.map((course) => {
    const item = attendanceMap[course.code] || { percentage: 0 };
    return `<div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 card-shadow"><span class="font-mono text-xs font-bold text-blue-600">${escapeHtml(course.code)}</span><h4 class="font-extrabold mt-3">${escapeHtml(course.title)}</h4><p class="text-xs text-slate-500 mt-2">${escapeHtml(course.instructor)} • ${course.creditHours} credit hours</p><p class="text-xs mt-3 font-bold">Attendance: ${item.percentage}%</p><p class="text-xs text-slate-500">${escapeHtml(course.lectureHall)}</p></div>`;
  }).join("");
}

async function renderStudentAttendanceDetails() {
  const tbody = document.getElementById("student-attendance-table-body");
  setLoading(tbody);
  const data = await ApiService.getStudentAttendance();
  tbody.innerHTML = data.courses.map((course) => `<tr class="border-b border-slate-100 dark:border-slate-800 text-xs"><td class="py-3.5 px-4 font-mono font-bold text-blue-600">${escapeHtml(course.code)}</td><td class="py-3.5 px-4 font-bold">${escapeHtml(course.title)}</td><td class="py-3.5 px-4 text-center">${course.held}</td><td class="py-3.5 px-4 text-center text-emerald-600 font-bold">${course.attended}</td><td class="py-3.5 px-4 text-center text-rose-600 font-bold">${course.missed}</td><td class="py-3.5 px-4 text-center font-bold">${course.percentage}%</td><td class="py-3.5 px-4 text-center">${course.eligible ? "Eligible for Exam" : "Short Attendance"}</td></tr>`).join("");
}

async function renderStudentUpcomingClasses() {
  const container = document.getElementById("student-today-classes");
  if (!container) return;
  const slots = (await ApiService.getTimetable()).filter((slot) => slot.day === new Date().toLocaleDateString("en-US", { weekday: "long" }));
  container.innerHTML = slots.length ? slots.map((slot) => `<div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"><div><div class="font-bold text-xs">${escapeHtml(slot.course.title)}</div><div class="text-[11px] text-slate-500">${escapeHtml(slot.course.code)} • ${escapeHtml(slot.lectureHall)}</div></div><span class="text-xs font-mono font-bold">${escapeHtml(slot.startTime)}</span></div>`).join("") : `<div class="text-xs text-slate-500">No classes scheduled today.</div>`;
}

async function renderFeeChallan() {
  const container = document.getElementById("fee-challan-view");
  setLoading(container);
  const voucher = await ApiService.getFeeVoucher();
  container.innerHTML = `<div class="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-md"><h2 class="text-xl font-black">Official Fee Voucher</h2><div class="grid grid-cols-2 gap-4 mt-5 text-xs"><div>Student: <strong>${escapeHtml(voucher.studentName)}</strong></div><div>Roll No: <strong>${escapeHtml(voucher.rollNo)}</strong></div><div>Semester: <strong>${voucher.semester}</strong></div><div>Amount: <strong>PKR ${Number(voucher.amount).toLocaleString()}</strong></div><div>Due Date: <strong>${new Date(voucher.dueDate).toLocaleDateString()}</strong></div><div>Status: <strong>${escapeHtml(voucher.status)}</strong></div></div></div>`;
}

async function renderRecentStudentsList() {
  const container = document.getElementById("recent-students-mini");
  if (!container) return;
  const students = await ApiService.getStudents();
  container.innerHTML = students.slice(0, 4).map((student) => `<div class="flex justify-between p-3 rounded-xl"><span class="text-xs font-bold">${escapeHtml(student.name)}</span><span class="text-xs font-mono text-slate-400">${escapeHtml(student.rollNo)}</span></div>`).join("");
}

async function renderRecentNoticesMini() {
  await renderNoticesList();
}

function showUnavailable(tabId) {
  const container = document.getElementById(tabId)?.querySelector("div[id$='grid'], tbody, .overflow-x-auto");
  if (container) showPanelMessage(container, "This feature is not available from the current backend API.");
}

function setupSearchAndFilters() {
  document.getElementById("student-search-input")?.addEventListener("input", loadStudents);
  document.getElementById("student-dept-filter")?.addEventListener("change", loadStudents);
}

function setupModals() {
  document.getElementById("add-student-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await ApiService.addStudent({
        name: document.getElementById("modal-stu-name").value,
        email: document.getElementById("modal-stu-email").value,
        rollNo: document.getElementById("modal-stu-roll").value,
        department: {
          "Computer Science": "CS",
          "Software Engineering": "SE",
          "Artificial Intelligence": "AI",
          "Business Administration": "BBA",
          "Electrical Engineering": "EE",
        }[document.getElementById("modal-stu-dept").value] || document.getElementById("modal-stu-dept").value,
        semester: Number(document.getElementById("modal-stu-sem").value),
        cgpa: Number(document.getElementById("modal-stu-cgpa").value),
      });
      closeModal("add-student-modal");
      await loadStudents();
      showToast("Student registered and saved in the database.", "success");
    } catch (error) { showToast(error.message, "error"); }
  });
  document.getElementById("add-notice-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await ApiService.publishNotice({
        title: document.getElementById("modal-notice-title").value,
        message: document.getElementById("modal-notice-body").value,
        priority: document.getElementById("modal-notice-pri").value.toLowerCase(),
      });
      closeModal("add-notice-modal");
      await renderNoticesList();
      showToast("Notice published and saved in the database.", "success");
    } catch (error) { showToast(error.message, "error"); }
  });
}

function viewStudentProfile(id) {
  showToast(`Student record: ${id}`);
}

function exportStudentsCSV() {
  showToast("Export uses the currently loaded backend student list.");
}

function openModal(id) { document.getElementById(id)?.classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id)?.classList.add("hidden"); }
function setupDarkMode() { document.getElementById("dark-mode-toggle")?.addEventListener("click", () => document.documentElement.classList.toggle("dark")); }
function toggleMobileSidebar() { document.getElementById("sidebar")?.classList.toggle("-translate-x-full"); }
function closeMobileSidebar() { document.getElementById("sidebar")?.classList.add("-translate-x-full"); }

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col space-y-2";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `${type === "error" ? "bg-rose-600" : type === "success" ? "bg-emerald-600" : "bg-slate-900"} text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}
