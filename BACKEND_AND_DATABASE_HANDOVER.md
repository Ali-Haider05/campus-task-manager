# 📋 Backend & Database Handover Documentation
### Apex University - Campus Management ERP System

Ye document **Backend Developer** aur **Database Administrator** ke liye banaya gaya hai. Isme database tables, relationships, aur tamam REST API endpoints ki mukammal details di gayi hain taake wo frontend ke sath 100% seamlessly integrate kar sakein.

---

## 🗄️ 1. Database Schema & Tables (MySQL / PostgreSQL)

Database developer ko ye 9 main tables banani hongi:

```sql
-- 1. Users Table (Authentication & Roles)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g. CS, SE, AI, BBA
    name VARCHAR(100) NOT NULL,
    hod_name VARCHAR(100),
    labs_count INT DEFAULT 0,
    budget VARCHAR(50)
);

-- 3. Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    roll_no VARCHAR(30) UNIQUE NOT NULL, -- e.g. BCS-FA22-019
    name VARCHAR(100) NOT NULL,
    dept_id INT,
    semester INT NOT NULL,
    cgpa DECIMAL(3, 2) DEFAULT 0.00,
    attendance_pct INT DEFAULT 100,
    fee_status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Pending',
    phone VARCHAR(20),
    city VARCHAR(50),
    status ENUM('Active', 'Warning', 'Suspended') DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 4. Faculty Table
CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    dept_id INT,
    designation VARCHAR(50), -- Professor, Assistant Professor, Lecturer
    qualification VARCHAR(100), -- Ph.D., MS
    phone VARCHAR(20),
    cabin_location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 5. Courses Table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. CS-311
    title VARCHAR(150) NOT NULL,
    credits INT NOT NULL,
    dept_id INT,
    teacher_id INT,
    room VARCHAR(50),
    timing VARCHAR(100),
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (teacher_id) REFERENCES faculty(id)
);

-- 6. Daily Attendance Table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    marked_by_faculty_id INT,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (marked_by_faculty_id) REFERENCES faculty(id)
);

-- 7. Course Grades / Marks Table
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    quiz_marks DECIMAL(5, 2) DEFAULT 0, -- out of 15
    assignment_marks DECIMAL(5, 2) DEFAULT 0, -- out of 15
    midterm_marks DECIMAL(5, 2) DEFAULT 0, -- out of 30
    final_marks DECIMAL(5, 2) DEFAULT 0, -- out of 40
    total_marks DECIMAL(5, 2) DEFAULT 0, -- out of 100
    letter_grade VARCHAR(5) DEFAULT 'F', -- A+, A, B, etc.
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE KEY unique_student_course (course_id, student_id)
);

-- 8. Fee Vouchers Table
CREATE TABLE fee_vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challan_no VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    semester VARCHAR(30) NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PAID', 'PENDING', 'PARTIAL') DEFAULT 'PENDING',
    paid_on DATE NULL,
    transaction_id VARCHAR(100) NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 9. Notice Board Table
CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('Examinations', 'Academic', 'Finance', 'Events', 'Careers') NOT NULL,
    priority ENUM('Normal', 'High', 'Urgent') DEFAULT 'Normal',
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 2. REST API Endpoints (Backend Developer Ko Kya Banana Hai)

Backend developer ko **Node.js (Express), Python (Django/FastAPI), ya Kotlin (Spring Boot)** me ye endpoints provide karne honge:

### A. Authentication & Roles
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Email + Password verify karke JWT Token aur User Role (`admin`, `faculty`, `student`) return kare. |
| `GET` | `/api/auth/me` | Logged-in user ka profile data return kare. |

### B. Admin Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Dashboard KPIs (Total Students, Faculty, Fee Collection %, Avg Attendance). |
| `GET` | `/api/students` | Tamam students ki list (search & filter support ke sath). |
| `POST` | `/api/students` | Naya student enroll karne ke liye form data save kare. |
| `DELETE` | `/api/students/:id` | Student record remove karne ke liye. |
| `GET` | `/api/faculty` | Faculty members ki list. |
| `GET` | `/api/departments` | Tamam departments, labs, aur budgets ki list. |

### C. Faculty Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/faculty/courses` | Current teacher ko assigned courses ki list. |
| `GET` | `/api/attendance/:courseId` | Course ke students ki attendance sheet. |
| `POST` | `/api/attendance/mark` | Daily attendance save kare (Present/Absent/Late). |
| `GET` | `/api/grades/:courseId` | Course ka gradebook / marks sheet. |
| `POST` | `/api/grades/save` | Quiz, Assignment, Mid, Final marks update kare. |

### D. Student Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/student/dashboard` | Logged-in student ka CGPA, attendance %, aur today schedule. |
| `GET` | `/api/student/courses` | Enrolled courses aur unke grades. |
| `GET` | `/api/student/attendance` | Subject-wise attendance matrix (attended vs missed). |
| `GET` | `/api/student/challan` | Current semester fee challan voucher data. |
| `GET` | `/api/student/admit-card` | Examination hall ticket / seat numbers. |

### E. Campus Notices
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notices` | All published notices. |
| `POST` | `/api/notices` | Admin / Faculty nayi notice publish kare. |

---

## 🔗 3. Frontend Ke Sath Connect Karne Ka Tareeqa

Abhi frontend me demo data **`js/data.js`** file se load ho raha hai.

Jab backend developer APIs bana le, toh frontend ke **`js/app.js`** me sirf **`fetch()`** ya **`axios`** call lagani hogi. 

**Example (Student List API se lana):**
```javascript
// Purana tareeqa (Local Data):
// renderStudentsTable(CampusDB.students);

// Naya tareeqa (Backend API se):
async function loadStudentsFromBackend() {
  try {
    const response = await fetch('http://localhost:5000/api/students', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const studentsData = await response.json();
    renderStudentsTable(studentsData);
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

---

## 🎯 Backend Developer Ko Summary Me Kya Bolna Hai?
Aap apne backend developer ko simple alfaz me ye 3 points bol sakte hain:
1. *"Database me **9 tables** banani hain: Users, Students, Faculty, Courses, Attendance, Grades, Departments, FeeVouchers, aur Notices."*
2. *"Backend par REST APIs banani hain jo JSON data return karein (Auth, Student CRUD, Attendance Marking, Gradebook Entry, Fee Status)."*
3. *"Frontend 100% ready hai, jaise hi endpoints ready honge hum `fetch()` laga kar connect kar lenge."*
