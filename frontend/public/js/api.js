// Handles API calls
const BASE_URL = "http://127.0.0.1:5000/api"; // Adjust as needed

// Example: Fetch All Students
async function fetchAllStudents() {
  try {
    const response = await fetch(`${BASE_URL}/students`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` // If using JWT
      }
    });
    return await response.json();
  } catch (err) {
    console.error("Error fetching students:", err);
    throw err;
  }
}

// Example: Create New Session
async function createSession(sessionData) {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(sessionData)
  });
  return await response.json();
}

// ... More APIs for sessions, semesters, levels, etc.
