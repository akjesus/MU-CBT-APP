// Handles login/logout
// auth.js

async function login(username, password) {
    try {
      const response = await fetch(`${BASE_URL}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Maybe store user info, redirect
        window.location.href = "admin/manage_sessions.html";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Error logging in");
    }
  }
  
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
  }
  
  // Check if logged in
  function isLoggedIn() {
    return !!localStorage.getItem("token");
  }
  