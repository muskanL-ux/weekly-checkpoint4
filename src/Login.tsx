
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setPassword(event.target.value);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      if (!data.token) {
        setMessage("Login response did not contain a token.");
        return;
      }

      // Keep JWT in memory for this demo session.
      // A refresh will require logging in again.
      sessionStorage.setItem("studentToken", data.token);

      setMessage(
        `Login successful! Welcome, ${data.student?.name || "Student"}!`
      );

      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registration-container">
      <h2>Student Login</h2>
      <p>Sign in to your student account</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="loginEmail">
          Email Address
        </label>

        <input
          id="loginEmail"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          required
        />

        <label htmlFor="loginPassword">
          Password
        </label>

        <input
          id="loginPassword"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p role="status">{message}</p>
      )}
    </div>
  );
}

export default Login;
