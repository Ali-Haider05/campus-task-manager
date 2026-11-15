// Apex University API Client Layer
// This file connects the Frontend UI with the Backend REST API.

// ⚙️ CONFIGURATION:
// Jab backend developer local chalaye toh: 'http://localhost:5000/api'
// Jab backend deploy ho jaye (Render/Railway par) toh: 'https://your-backend.onrender.com/api'
const API_BASE_URL = 'http://localhost:5000/api';

// Agar backend band ho ya abhi tak connect na hua ho, toh true rakhein (Demo data chalega).
// Jab backend chal jaye toh isko false kar dein (Real database chalega).
const USE_MOCK_FALLBACK = true;

const ApiService = {
  // Helper to attach JWT Bearer token
  getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // ==================== 1. AUTHENTICATION ====================
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_role', data.user.role);
      return data;
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[API] Backend offline. Using demo login.');
        return { token: 'mock-jwt-token', user: { email, role: 'admin', name: 'Demo User' } };
      }
      throw err;
    }
  },

  // ==================== 2. STUDENTS (CRUD) ====================
  async getStudents() {
    try {
      const res = await fetch(`${API_BASE_URL}/students`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[API] Backend offline. Falling back to CampusDB.students');
        return CampusDB.students;
      }
      throw err;
    }
  },

  async addStudent(studentData) {
    try {
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(studentData)
      });
      if (!res.ok) throw new Error('Failed to save student in database');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[API] Backend offline. Saving temporarily in memory.');
        studentData.id = 'STU-' + (CampusDB.students.length + 101);
        CampusDB.students.unshift(studentData);
        return studentData;
      }
      throw err;
    }
  },

  // ==================== 3. ATTENDANCE ====================
  async markAttendance(attendanceData) {
    // attendanceData: { courseId, date, records: [{ studentId, status: 'present'|'absent'|'late' }] }
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(attendanceData)
      });
      if (!res.ok) throw new Error('Failed to record attendance');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[API] Backend offline. Simulated attendance save.');
        return { success: true, message: 'Simulated attendance save' };
      }
      throw err;
    }
  },

  // ==================== 4. GRADEBOOK / MARKS ====================
  async saveGrades(courseId, gradeRecords) {
    try {
      const res = await fetch(`${API_BASE_URL}/grades/save`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ courseId, grades: gradeRecords })
      });
      if (!res.ok) throw new Error('Failed to update grades in database');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        console.warn('[API] Backend offline. Simulated grades save.');
        return { success: true };
      }
      throw err;
    }
  },

  // ==================== 5. NOTICES ====================
  async getNotices() {
    try {
      const res = await fetch(`${API_BASE_URL}/notices`, { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch notices');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) return CampusDB.notices;
      throw err;
    }
  },

  async publishNotice(noticeData) {
    try {
      const res = await fetch(`${API_BASE_URL}/notices`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(noticeData)
      });
      if (!res.ok) throw new Error('Failed to publish notice');
      return await res.json();
    } catch (err) {
      if (USE_MOCK_FALLBACK) {
        noticeData.id = CampusDB.notices.length + 1;
        CampusDB.notices.unshift(noticeData);
        return noticeData;
      }
      throw err;
    }
  }
};
