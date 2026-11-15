import Student from "../models/Student.js";
import User from "../models/User.js";

const getStudents = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const studentQuery = department ? { department } : {};
    const students = await Student.find(studentQuery)
      .populate("user", "name")
      .select("user rollNo department semester cgpa")
      .sort({ rollNo: 1 });

    const normalizedSearch = search?.trim().toLowerCase();
    const filteredStudents = normalizedSearch
      ? students.filter((student) =>
          student.user.name.toLowerCase().includes(normalizedSearch) ||
          student.rollNo.toLowerCase().includes(normalizedSearch),
        )
      : students;

    res.json(
      filteredStudents.map((student) => ({
        id: student._id,
        name: student.user.name,
        rollNo: student.rollNo,
        department: student.department,
        semester: student.semester,
        cgpa: student.cgpa,
      })),
    );
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  let user;

  try {
    const { name, email, rollNo, department, semester, cgpa } = req.body;
    if (
      !name ||
      !email ||
      !rollNo ||
      !department ||
      semester === undefined ||
      cgpa === undefined
    ) {
      res.status(400).json({ message: "All student fields are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existingEmail, existingRollNo] = await Promise.all([
      User.exists({ email: normalizedEmail }),
      Student.exists({ rollNo: rollNo.trim() }),
    ]);
    if (existingEmail || existingRollNo) {
      res.status(400).json({ message: "Email or rollNo already exists" });
      return;
    }

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: "Student@123",
      role: "student",
    });
    const student = await Student.create({
      user: user._id,
      rollNo: rollNo.trim(),
      department: department.trim(),
      semester,
      cgpa,
    });

    res.status(201).json({
      id: student._id,
      name: user.name,
      email: user.email,
      rollNo: student.rollNo,
      department: student.department,
      semester: student.semester,
      cgpa: student.cgpa,
    });
  } catch (error) {
    if (user?._id && error.code === 11000) {
      await User.findByIdAndDelete(user._id);
      res.status(400).json({ message: "Email or rollNo already exists" });
      return;
    }
    next(error);
  }
};

export { createStudent, getStudents };
