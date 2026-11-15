let adminEnrollmentChart = null;
let adminFeeChart = null;
let studentAttendanceChart = null;
let studentGpaChart = null;

async function initAdminCharts() {
  try {
    const data = await ApiService.getCharts();
    const enrollmentCanvas = document.getElementById("enrollmentChart");
    const feeCanvas = document.getElementById("feeChart");
    if (enrollmentCanvas) {
      adminEnrollmentChart?.destroy();
      adminEnrollmentChart = new Chart(enrollmentCanvas, {
        type: "bar",
        data: {
          labels: data.enrollmentByDepartment.map((item) => item.department),
          datasets: [{ label: "Enrolled Students", data: data.enrollmentByDepartment.map((item) => item.count), backgroundColor: "#2563eb", borderRadius: 6 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } },
      });
    }
    if (feeCanvas) {
      adminFeeChart?.destroy();
      adminFeeChart = new Chart(feeCanvas, {
        type: "doughnut",
        data: { labels: ["Paid", "Unpaid"], datasets: [{ data: [data.feeBreakdown.paid, data.feeBreakdown.unpaid], backgroundColor: ["#10b981", "#ef4444"], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, cutout: "70%" },
      });
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function initStudentCharts() {
  try {
    const [attendance, gpa] = await Promise.all([ApiService.getStudentAttendance(), ApiService.getGpaHistory()]);
    const attendanceCanvas = document.getElementById("studentAttendanceChart");
    const gpaCanvas = document.getElementById("studentGpaChart");
    if (attendanceCanvas) {
      studentAttendanceChart?.destroy();
      studentAttendanceChart = new Chart(attendanceCanvas, {
        type: "radar",
        data: { labels: attendance.courses.map((item) => item.code), datasets: [{ label: "Attendance %", data: attendance.courses.map((item) => item.percentage), backgroundColor: "rgba(37, 99, 235, 0.2)", borderColor: "#2563eb", pointBackgroundColor: "#2563eb" }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 50, suggestedMax: 100, ticks: { stepSize: 10 } } } },
      });
    }
    if (gpaCanvas) {
      studentGpaChart?.destroy();
      studentGpaChart = new Chart(gpaCanvas, {
        type: "line",
        data: { labels: gpa.map((item) => `Semester ${item.semester}`), datasets: [{ label: "GPA", data: gpa.map((item) => item.gpa), borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.1)", fill: true, tension: 0.3, pointRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 2, max: 4 } } },
      });
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}
