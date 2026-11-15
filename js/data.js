// Mock Database for University Campus Management System
const CampusDB = {
  university: {
    name: "Apex International University",
    tagline: "Center of Excellence & Innovation",
    campus: "Main Campus - Blue Area",
    currentSemester: "Fall 2026",
    session: "2024 - 2028"
  },

  stats: {
    totalStudents: 4820,
    activeFaculty: 245,
    departments: 8,
    activeCourses: 132,
    feeCollectionRate: "92.4%",
    avgAttendance: "86.8%"
  },

  students: [
    { id: "STU-101", name: "Muhammad Ali Khan", rollNo: "BCS-FA22-019", dept: "Computer Science", semester: 6, cgpa: 3.78, attendance: 91, feeStatus: "Paid", email: "ali.khan@campus.edu.pk", phone: "+92 301 4567891" },
    { id: "STU-102", name: "Ayesha Fatima", rollNo: "BSE-FA22-045", dept: "Software Engineering", semester: 6, cgpa: 3.92, attendance: 96, feeStatus: "Paid", email: "ayesha.f@campus.edu.pk", phone: "+92 312 9876543" },
    { id: "STU-103", name: "Hamza Ahmed", rollNo: "BAI-FA23-012", dept: "Artificial Intelligence", semester: 4, cgpa: 3.45, attendance: 82, feeStatus: "Pending", email: "hamza.a@campus.edu.pk", phone: "+92 333 1122334" },
    { id: "STU-104", name: "Zainab Tariq", rollNo: "BCS-SP23-088", dept: "Computer Science", semester: 5, cgpa: 3.65, attendance: 88, feeStatus: "Paid", email: "zainab.t@campus.edu.pk", phone: "+92 345 5566778" },
    { id: "STU-105", name: "Usman Raza", rollNo: "BBA-FA22-031", dept: "Business Administration", semester: 6, cgpa: 3.20, attendance: 76, feeStatus: "Partial", email: "usman.r@campus.edu.pk", phone: "+92 300 9988776" },
    { id: "STU-106", name: "Sara Noor", rollNo: "BEE-FA21-009", dept: "Electrical Engineering", semester: 8, cgpa: 3.84, attendance: 94, feeStatus: "Paid", email: "sara.n@campus.edu.pk", phone: "+92 321 4455667" },
    { id: "STU-107", name: "Bilal Sheikh", rollNo: "BCS-FA23-110", dept: "Computer Science", semester: 4, cgpa: 2.95, attendance: 68, feeStatus: "Pending", email: "bilal.s@campus.edu.pk", phone: "+92 315 2233445" }
  ],

  faculty: [
    { id: "FAC-201", name: "Dr. Tariq Mehmood", dept: "Computer Science", designation: "Professor & HoD", email: "tariq.m@campus.edu.pk", courses: ["Design & Analysis of Algorithms", "Advanced AI"], phone: "+92 300 1234567" },
    { id: "FAC-202", name: "Engr. Fatima Zahra", dept: "Software Engineering", designation: "Assistant Professor", email: "f.zahra@campus.edu.pk", courses: ["Software Architecture", "Web Technologies"], phone: "+92 333 7654321" },
    { id: "FAC-203", name: "Dr. Naveed Akhtar", dept: "Computer Science", designation: "Associate Professor", email: "n.akhtar@campus.edu.pk", courses: ["Database Systems", "Cloud Computing"], phone: "+92 312 3456789" },
    { id: "FAC-204", name: "Ms. Sadia Munir", dept: "Business Administration", designation: "Senior Lecturer", email: "s.munir@campus.edu.pk", courses: ["Principles of Management", "Marketing Strategy"], phone: "+92 345 8899001" }
  ],

  courses: [
    { code: "CS-311", title: "Design & Analysis of Algorithms", credits: 3, teacher: "Dr. Tariq Mehmood", room: "Lab-402", timing: "Mon & Wed 09:00 - 10:30 AM", attendance: 92, grade: "A" },
    { code: "CS-315", title: "Database Systems & Design", credits: 4, teacher: "Dr. Naveed Akhtar", room: "Lab-201", timing: "Tue & Thu 11:00 - 01:00 PM", attendance: 88, grade: "A-" },
    { code: "SE-322", title: "Web Application Engineering", credits: 3, teacher: "Engr. Fatima Zahra", room: "CS-Hall B", timing: "Mon & Wed 01:30 - 03:00 PM", attendance: 95, grade: "A+" },
    { code: "CS-319", title: "Operating Systems Principles", credits: 3, teacher: "Dr. Salman Qureshi", room: "Room-105", timing: "Fri 09:00 - 12:00 PM", attendance: 85, grade: "B+" },
    { code: "HU-204", title: "Technical & Report Writing", credits: 2, teacher: "Ms. Amina Bilal", room: "Auditorium-1", timing: "Thursday 02:00 - 04:00 PM", attendance: 90, grade: "A" }
  ],

  notices: [
    { id: 1, title: "Mid-Term Examination Schedule - Fall 2026", date: "Nov 14, 2026", category: "Examinations", author: "Controller of Exams", priority: "High", content: "All regular and repeat students are informed that Mid-Term Examinations will commence from 25th November 2026. Hall tickets can be downloaded from the portal." },
    { id: 2, title: "Semester Fee Clearance Deadline Reminder", date: "Nov 12, 2026", category: "Finance", author: "Accounts Department", priority: "Urgent", content: "Students with pending fee dues are advised to submit their challan slips to avoid late surcharge and admit card suspension." },
    { id: 3, title: "Annual Campus Hackathon & Tech Exhibition", date: "Nov 08, 2026", category: "Events", author: "IEEE Student Branch", priority: "Normal", content: "Registrations are now open for the 48-hour Apex CodeSprint 2026. Cash prizes worth PKR 300,000 for winning projects." },
    { id: 4, title: "Winter Internship Drive - Leading Software Houses", date: "Nov 05, 2026", category: "Careers", author: "Placement Bureau", priority: "Normal", content: "Top tech companies will be conducting on-campus recruitment tests next Monday for 7th & 8th-semester students." }
  ],

  timetable: [
    { day: "Monday", slots: [
      { time: "09:00 - 10:30 AM", course: "Design & Analysis of Algorithms", code: "CS-311", teacher: "Dr. Tariq", room: "Lab-402" },
      { time: "11:00 - 12:30 PM", course: "Operating Systems", code: "CS-319", teacher: "Dr. Salman", room: "Room-105" },
      { time: "01:30 - 03:00 PM", course: "Web Application Engineering", code: "SE-322", teacher: "Engr. Fatima", room: "CS-Hall B" }
    ]},
    { day: "Tuesday", slots: [
      { time: "11:00 - 01:00 PM", course: "Database Systems & Design (Lab)", code: "CS-315", teacher: "Dr. Naveed", room: "Lab-201" },
      { time: "02:00 - 03:30 PM", course: "Technical & Report Writing", code: "HU-204", teacher: "Ms. Amina", room: "Auditorium-1" }
    ]},
    { day: "Wednesday", slots: [
      { time: "09:00 - 10:30 AM", course: "Design & Analysis of Algorithms", code: "CS-311", teacher: "Dr. Tariq", room: "Lab-402" },
      { time: "01:30 - 03:00 PM", course: "Web Application Engineering", code: "SE-322", teacher: "Engr. Fatima", room: "CS-Hall B" }
    ]},
    { day: "Thursday", slots: [
      { time: "11:00 - 01:00 PM", course: "Database Systems Theory", code: "CS-315", teacher: "Dr. Naveed", room: "Room-204" },
      { time: "02:00 - 04:00 PM", course: "Software Quality Assurance", code: "SE-412", teacher: "Dr. Imran", room: "Lab-303" }
    ]},
    { day: "Friday", slots: [
      { time: "09:00 - 11:30 AM", course: "Operating Systems Principles (Lab)", code: "CS-319", teacher: "Dr. Salman", room: "Lab-102" }
    ]}
  ],

  feeChallan: {
    challanNo: "CH-2026-88421",
    dueDate: "20 Nov 2026",
    studentName: "Muhammad Ali Khan",
    rollNo: "BCS-FA22-019",
    semester: "6th (Fall 2026)",
    department: "Computer Science",
    items: [
      { desc: "Tuition Fee (15 Credit Hours @ 4,500)", amount: 67500 },
      { desc: "Computer Lab & Software License Fee", amount: 8000 },
      { desc: "Library & Digital Resources Fund", amount: 2500 },
      { desc: "Campus Sports & Activity Dues", amount: 2000 },
      { desc: "Examination & Assessment Fund", amount: 3500 }
    ],
    totalAmount: 83500,
    status: "PAID",
    paidOn: "05 Nov 2026",
    bankDetails: "Habib Bank Limited (HBL) - A/C 0921-7901234503"
  }
};
