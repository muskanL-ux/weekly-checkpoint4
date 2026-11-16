
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const STUDENTS_FILE = path.join(
  __dirname,
  "Data",
  "students.json"
);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ]
}));

app.use(express.json());

// Read students
async function readStudents() {
  const data = await fs.readFile(STUDENTS_FILE, "utf8");
  return JSON.parse(data);
}

// Save students
async function saveStudents(students) {
  await fs.writeFile(
    STUDENTS_FILE,
    JSON.stringify(students, null, 2),
    "utf8"
  );
}

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "School Students Registration Backend is Running!"
  });
});

// Registration API
app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      gender,
      password,
      confirmPassword
    } = req.body || {};

    if (
      [name, email, contact, gender, password, confirmPassword]
        .some(value => typeof value !== "string" || !value.trim())
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({
        message: "Invalid gender selection"
      });
    }

    const students = await readStudents();
    const normalizedEmail = email.trim().toLowerCase();

    const existingStudent = students.find(
      student => student.email === normalizedEmail
    );

    if (existingStudent) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      contact: contact.trim(),
      gender,
      password: hashedPassword
    };

    students.push(newStudent);
    await saveStudents(students);

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const students = await readStudents();

    const student = students.find(
      s => s.email === email.trim().toLowerCase()
    );

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: student.id,
        email: student.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Verify JWT token
function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authorization.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

// Protected student profile
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const students = await readStudents();

    const student = students.find(
      s => s.id === req.user.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      contact: student.contact,
      gender: student.gender
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
