import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Student registered successfully!");

      setForm({
        name: "",
        email: "",
        contact: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registration-container">
      <h2>Student Registration</h2>
      <p>Create your student account</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="contact">Contact Number</label>
        <input
          id="contact"
          type="tel"
          name="contact"
          placeholder="Enter your contact number"
          value={form.contact}
          onChange={handleChange}
          required
        />

        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <label htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && (
        <p role="status">{message}</p>
      )}
    </div>
  );
}

export default Register;
