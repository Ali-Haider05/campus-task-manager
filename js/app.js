// Main Application Logic for Campus Management System

let currentRole = 'admin'; // 'admin', 'faculty', 'student'
let currentTab = 'admin-dashboard';
let attendanceState = {}; // Key: studentId, Value: 'present' | 'absent' | 'late'

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupRoleSwitcher();
  setupSearchAndFilters();
  setupModals();
  setupDarkMode();
  switchRole('admin'); // Default starting role
});

// Switch User Role
function switchRole(role) {
  currentRole = role;
  
  // Update badge & user profile in UI
  const roleBadges = document.querySelectorAll('.role-indicator');
  const roleAvatars = document.querySelectorAll('.user-role-label');
  const roleUserNames = document.querySelectorAll('.user-name-label');

  let title = 'System Administrator';
  let name = 'Admin Office (Superuser)';
  let defaultTab = 'admin-dashboard';

  if (role === 'faculty') {
    title = 'Associate Professor (CS)';
    name = 'Dr. Tariq Mehmood';
    defaultTab = 'faculty-dashboard';
  } else if (role === 'student') {
    title = 'Undergraduate Student (BSCS)';
    name = 'Muhammad Ali Khan';
    defaultTab = 'student-dashboard';
  }

  roleBadges.forEach(b => b.textContent = role.toUpperCase());
  roleAvatars.forEach(a => a.textContent = title);
  roleUserNames.forEach(n => n.textContent = name);

  // Toggle active class on role switcher buttons
  document.querySelectorAll('[data-role-switch]').forEach(btn => {
    if (btn.getAttribute('data-role-switch') === role) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300');
    }
  });

  // Show/Hide Sidebar Navigation Sections
  document.getElementById('nav-admin-group').style.display = (role === 'admin') ? 'block' : 'none';
  document.getElementById('nav-faculty-group').style.display = (role === 'faculty') ? 'block' : 'none';
  document.getElementById('nav-student-group').style.display = (role === 'student') ? 'block' : 'none';

  // Navigate to default tab of this role
  switchTab(defaultTab);
  showToast(`Switched to ${role.toUpperCase()} View`);
}

// Switch Active View Tab
function switchTab(tabId) {
  currentTab = tabId;

  // Hide all view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // Show target panel
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('animate-fade-in');
  }

  // Update sidebar active highlights
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold', 'dark:bg-slate-800', 'dark:text-blue-400');
      link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'dark:text-slate-300');
    } else {
      link.classList.remove('bg-blue-50', 'text-blue-600', 'font-semibold', 'dark:bg-slate-800', 'dark:text-blue-400');
      link.classList.add('text-slate-600', 'hover:bg-slate-50', 'dark:text-slate-300');
    }
  });

  // Render dynamic content for the tab
  renderTabData(tabId);

  // Close mobile sidebar if open
  closeMobileSidebar();
}

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });
}

function setupRoleSwitcher() {
  document.querySelectorAll('[data-role-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role-switch');
      switchRole(role);
    });
  });
}

// Render data based on current active tab
function renderTabData(tabId) {
  if (tabId === 'admin-dashboard') {
    setTimeout(initAdminCharts, 50);
    renderRecentStudentsList();
    renderRecentNoticesMini();
  } else if (tabId === 'admin-students') {
    renderStudentsTable(CampusDB.students);
  } else if (tabId === 'admin-faculty') {
    renderFacultyTable(CampusDB.faculty);
  } else if (tabId === 'admin-timetable') {
    renderTimetableGrid();
  } else if (tabId === 'admin-notices' || tabId === 'faculty-notices' || tabId === 'student-notices') {
    renderNoticesList();
  } else if (tabId === 'faculty-dashboard') {
    renderFacultyOverview();
  } else if (tabId === 'faculty-attendance') {
    initAttendanceMarker();
  } else if (tabId === 'student-dashboard') {
    setTimeout(initStudentCharts, 50);
    renderStudentUpcomingClasses();
  } else if (tabId === 'student-courses') {
    renderStudentCourses();
  } else if (tabId === 'student-attendance') {
    renderStudentAttendanceDetails();
  } else if (tabId === 'student-timetable') {
    renderTimetableGrid('student-timetable-container');
  } else if (tabId === 'student-challan') {
    renderFeeChallan();
  }
}

// Render Students Table (Admin)
function renderStudentsTable(list) {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  list.forEach(stu => {
    const feeBadge = stu.feeStatus === 'Paid' 
      ? '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">Paid</span>'
      : (stu.feeStatus === 'Pending' 
        ? '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400">Pending</span>'
        : '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">Partial</span>');

    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">${stu.rollNo}</td>
      <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">${stu.name}</td>
      <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">${stu.dept}</td>
      <td class="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-200">${stu.semester}th</td>
      <td class="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">${stu.cgpa.toFixed(2)}</td>
      <td class="py-3 px-4 text-center font-medium ${stu.attendance < 75 ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-200'}">${stu.attendance}%</td>
      <td class="py-3 px-4 text-center">${feeBadge}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="viewStudentProfile('${stu.id}')" class="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition">View</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Faculty Table
function renderFacultyTable(list) {
  const tbody = document.getElementById('faculty-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  list.forEach(f => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">${f.name}</td>
      <td class="py-3 px-4 text-xs text-blue-600 dark:text-blue-400 font-medium">${f.designation}</td>
      <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">${f.dept}</td>
      <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">${f.courses.join(', ')}</td>
      <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">${f.email}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="showToast('Contact: ${f.phone}')" class="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md dark:bg-blue-950 dark:text-blue-300">Message</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Interactive Attendance Marker for Faculty
function initAttendanceMarker() {
  const container = document.getElementById('attendance-marking-list');
  if (!container) return;
  container.innerHTML = '';

  CampusDB.students.forEach(stu => {
    if (!attendanceState[stu.id]) attendanceState[stu.id] = 'present';

    const row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 gap-3';
    row.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
          ${stu.name.charAt(0)}
        </div>
        <div>
          <div class="text-sm font-semibold text-slate-800 dark:text-white">${stu.name}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">${stu.rollNo} • Current: ${stu.attendance}%</div>
        </div>
      </div>
      <div class="flex items-center space-x-2" id="att-buttons-${stu.id}">
        <button onclick="setStudentAttendance('${stu.id}', 'present')" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${attendanceState[stu.id] === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'}">Present</button>
        <button onclick="setStudentAttendance('${stu.id}', 'absent')" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${attendanceState[stu.id] === 'absent' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50'}">Absent</button>
        <button onclick="setStudentAttendance('${stu.id}', 'late')" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${attendanceState[stu.id] === 'late' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50'}">Late</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function setStudentAttendance(stuId, status) {
  attendanceState[stuId] = status;
  initAttendanceMarker(); // Refresh active states
}

function saveFacultyAttendance() {
  showToast('Attendance recorded and synced to Academic Portal successfully!', 'success');
}

// Timetable Renderer
function renderTimetableGrid(containerId = 'admin-timetable-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  CampusDB.timetable.forEach(t => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm';
    
    let slotsHtml = t.slots.map(s => `
      <div class="p-3 mb-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-l-4 border-blue-500 text-xs">
        <div class="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
          <span>${s.course}</span>
          <span class="text-blue-600 dark:text-blue-400 font-mono">${s.time}</span>
        </div>
        <div class="text-slate-500 dark:text-slate-400 flex justify-between">
          <span>Instructor: ${s.teacher}</span>
          <span class="font-semibold text-slate-600 dark:text-slate-300">${s.room}</span>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <h4 class="font-bold text-base text-slate-900 dark:text-white pb-2 mb-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span>${t.day}</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono">${t.slots.length} Lectures</span>
      </h4>
      <div>${slotsHtml}</div>
    `;
    container.appendChild(card);
  });
}

// Notices Renderer
function renderNoticesList() {
  const containers = [
    document.getElementById('admin-notices-list'),
    document.getElementById('faculty-notices-list'),
    document.getElementById('student-notices-list')
  ];

  containers.forEach(container => {
    if (!container) return;
    container.innerHTML = '';

    CampusDB.notices.forEach(n => {
      const priorityBadge = n.priority === 'Urgent' 
        ? '<span class="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700">Urgent</span>'
        : (n.priority === 'High' ? '<span class="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-700">High</span>' : '<span class="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">Normal</span>');

      const item = document.createElement('div');
      item.className = 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm';
      item.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${n.category}</span>
            ${priorityBadge}
          </div>
          <span class="text-xs text-slate-400 font-mono">${n.date}</span>
        </div>
        <h4 class="text-base font-bold text-slate-800 dark:text-white mb-1.5">${n.title}</h4>
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">${n.content}</p>
        <div class="text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2.5">
          <span>Issued by: <strong class="text-slate-600 dark:text-slate-200">${n.author}</strong></span>
          <button onclick="showToast('Notice pinned to your board')" class="text-blue-600 hover:underline">Pin Notice</button>
        </div>
      `;
      container.appendChild(item);
    });
  });
}

// Student Portal Helpers
function renderStudentCourses() {
  const container = document.getElementById('student-courses-grid');
  if (!container) return;
  container.innerHTML = '';

  CampusDB.courses.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">${c.code}</span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${c.credits} Credit Hours</span>
        </div>
        <h4 class="font-bold text-slate-800 dark:text-white text-base mb-1">${c.title}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3"><i class="fa-solid fa-user-tie mr-1.5"></i>${c.teacher}</p>
        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
          <div><i class="fa-regular fa-clock mr-1 text-blue-500"></i> ${c.timing}</div>
          <div><i class="fa-solid fa-location-dot mr-1 text-emerald-500"></i> ${c.room}</div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs font-semibold mb-1">
          <span class="text-slate-600 dark:text-slate-400">Attendance</span>
          <span class="${c.attendance < 75 ? 'text-red-500' : 'text-emerald-600'}">${c.attendance}%</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
          <div class="h-full ${c.attendance < 75 ? 'bg-red-500' : 'bg-emerald-500'}" style="width: ${c.attendance}%"></div>
        </div>
        <div class="flex space-x-2">
          <button onclick="showToast('Syllabus & Slides opened for ${c.code}')" class="flex-1 py-1.5 text-xs font-semibold text-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">Course Materials</button>
          <button onclick="showToast('Current Grade Standing: ${c.grade}')" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Grade: ${c.grade}</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderStudentAttendanceDetails() {
  const tbody = document.getElementById('student-attendance-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  CampusDB.courses.forEach(c => {
    const totalClasses = 32;
    const attended = Math.round((c.attendance / 100) * totalClasses);
    const missed = totalClasses - attended;
    const statusBadge = c.attendance >= 75 
      ? '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Eligible for Exam</span>'
      : '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Short Attendance Warning</span>';

    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 dark:border-slate-800';
    tr.innerHTML = `
      <td class="py-3 px-4 font-mono text-xs font-bold text-blue-600">${c.code}</td>
      <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">${c.title}</td>
      <td class="py-3 px-4 text-center font-mono">${totalClasses}</td>
      <td class="py-3 px-4 text-center font-mono text-emerald-600 font-bold">${attended}</td>
      <td class="py-3 px-4 text-center font-mono text-rose-600 font-bold">${missed}</td>
      <td class="py-3 px-4 text-center font-bold">${c.attendance}%</td>
      <td class="py-3 px-4 text-center">${statusBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderFeeChallan() {
  const container = document.getElementById('fee-challan-view');
  if (!container) return;
  const f = CampusDB.feeChallan;

  let itemsHtml = f.items.map((item, idx) => `
    <tr class="border-b border-slate-100 dark:border-slate-800">
      <td class="py-2.5 px-3 text-slate-500 text-xs">${idx + 1}</td>
      <td class="py-2.5 px-3 text-slate-800 dark:text-slate-200 text-sm">${item.desc}</td>
      <td class="py-2.5 px-3 text-right font-mono text-sm font-semibold">PKR ${item.amount.toLocaleString()}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div id="printable-challan" class="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-md">
      <div class="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-5 mb-5">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">${CampusDB.university.name}</h2>
          <p class="text-xs text-slate-500">${CampusDB.university.campus} • Official Fee Voucher</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800'}">${f.status}</span>
          <div class="text-xs font-mono text-slate-500 mt-1">Challan: <strong>${f.challanNo}</strong></div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-6 text-xs">
        <div><span class="text-slate-400 block">Student:</span><strong class="text-slate-800 dark:text-white">${f.studentName}</strong></div>
        <div><span class="text-slate-400 block">Roll No:</span><strong class="font-mono text-slate-800 dark:text-white">${f.rollNo}</strong></div>
        <div><span class="text-slate-400 block">Semester:</span><strong class="text-slate-800 dark:text-white">${f.semester}</strong></div>
        <div><span class="text-slate-400 block">Due Date:</span><strong class="text-rose-600">${f.dueDate}</strong></div>
      </div>

      <table class="w-full mb-6">
        <thead>
          <tr class="border-b-2 border-slate-200 dark:border-slate-700 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th class="py-2 px-3">#</th>
            <th class="py-2 px-3">Description</th>
            <th class="py-2 px-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr class="border-t-2 border-slate-300 dark:border-slate-600 font-bold">
            <td colspan="2" class="py-3 px-3 text-right uppercase text-sm text-slate-700 dark:text-slate-200">Total Payable:</td>
            <td class="py-3 px-3 text-right text-lg font-mono text-blue-600 dark:text-blue-400">PKR ${f.totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div class="text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>Designated Bank: <strong>${f.bankDetails}</strong></div>
        <div class="flex space-x-2 no-print">
          <button onclick="window.print()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm text-xs flex items-center space-x-1.5"><i class="fa-solid fa-print mr-1"></i> Print / Download PDF</button>
        </div>
      </div>
    </div>
  `;
}

// Mini components
function renderRecentStudentsList() {
  const container = document.getElementById('recent-students-mini');
  if (!container) return;
  container.innerHTML = '';

  CampusDB.students.slice(0, 4).forEach(s => {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition';
    item.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
          ${s.name.charAt(0)}
        </div>
        <div>
          <div class="text-xs font-bold text-slate-800 dark:text-white">${s.name}</div>
          <div class="text-[11px] text-slate-500 font-mono">${s.rollNo}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs font-bold text-emerald-600">GPA ${s.cgpa.toFixed(2)}</div>
        <div class="text-[10px] text-slate-400">${s.dept.split(' ')[0]}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderRecentNoticesMini() {
  const container = document.getElementById('recent-notices-mini');
  if (!container) return;
  container.innerHTML = '';

  CampusDB.notices.slice(0, 3).forEach(n => {
    const item = document.createElement('div');
    item.className = 'p-2.5 rounded-lg border-l-2 border-blue-500 bg-slate-50 dark:bg-slate-800/50 text-xs mb-2';
    item.innerHTML = `
      <div class="flex justify-between text-[11px] text-slate-400 mb-1">
        <span class="font-semibold text-blue-600 dark:text-blue-400">${n.category}</span>
        <span>${n.date}</span>
      </div>
      <div class="font-bold text-slate-800 dark:text-white mb-0.5 line-clamp-1">${n.title}</div>
      <div class="text-slate-500 line-clamp-1 text-[11px]">${n.content}</div>
    `;
    container.appendChild(item);
  });
}

function renderStudentUpcomingClasses() {
  const container = document.getElementById('student-today-classes');
  if (!container) return;
  container.innerHTML = '';

  CampusDB.timetable[0].slots.forEach(s => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700';
    div.innerHTML = `
      <div>
        <div class="font-bold text-xs text-slate-800 dark:text-white">${s.course}</div>
        <div class="text-[11px] text-slate-500">${s.teacher} • <span class="font-semibold text-blue-600">${s.room}</span></div>
      </div>
      <span class="text-xs font-mono px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">${s.time}</span>
    `;
    container.appendChild(div);
  });
}

function renderFacultyOverview() {
  // Populated in static HTML + dynamic updates
}

// Search and Filter functionality
function setupSearchAndFilters() {
  const studentSearch = document.getElementById('student-search-input');
  const deptFilter = document.getElementById('student-dept-filter');

  if (studentSearch) {
    studentSearch.addEventListener('input', filterStudents);
  }
  if (deptFilter) {
    deptFilter.addEventListener('change', filterStudents);
  }
}

function filterStudents() {
  const query = (document.getElementById('student-search-input')?.value || '').toLowerCase();
  const dept = document.getElementById('student-dept-filter')?.value || 'All';

  const filtered = CampusDB.students.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(query) || s.rollNo.toLowerCase().includes(query);
    const matchDept = (dept === 'All') || (s.dept === dept);
    return matchQuery && matchDept;
  });

  renderStudentsTable(filtered);
}

// Modals Handler
function setupModals() {
  const addStudentModal = document.getElementById('add-student-modal');
  const addStudentForm = document.getElementById('add-student-form');

  if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newStudent = {
        id: 'STU-' + (CampusDB.students.length + 101),
        name: document.getElementById('modal-stu-name').value,
        rollNo: document.getElementById('modal-stu-roll').value,
        dept: document.getElementById('modal-stu-dept').value,
        semester: parseInt(document.getElementById('modal-stu-sem').value),
        cgpa: parseFloat(document.getElementById('modal-stu-cgpa').value || '3.50'),
        attendance: 100,
        feeStatus: 'Pending',
        email: document.getElementById('modal-stu-email').value,
        phone: '+92 300 0000000'
      };

      CampusDB.students.unshift(newStudent);
      renderStudentsTable(CampusDB.students);
      closeModal('add-student-modal');
      showToast(`Student ${newStudent.name} registered successfully!`, 'success');
      addStudentForm.reset();
    });
  }
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('hidden');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

function viewStudentProfile(id) {
  const s = CampusDB.students.find(x => x.id === id);
  if (!s) return;
  alert(`Student Profile:\nName: ${s.name}\nRoll No: ${s.rollNo}\nDepartment: ${s.dept}\nSemester: ${s.semester}\nCGPA: ${s.cgpa}\nAttendance: ${s.attendance}%\nFee Status: ${s.feeStatus}\nEmail: ${s.email}`);
}

// Toast Alert System
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white';
  toast.className = `${bg} px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center space-x-2 transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Mobile sidebar controls
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('-translate-x-full');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }
}

// Dark Mode Toggle
function setupDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    toggleBtn.innerHTML = isDark 
      ? '<i class="fa-solid fa-sun text-amber-400"></i>' 
      : '<i class="fa-solid fa-moon text-slate-600"></i>';
    showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`);
  });
}
