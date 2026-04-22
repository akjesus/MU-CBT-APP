// src/pages/Auth/Login.js
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/bg-large.jpg"; 
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        showSnackbar("Logged in successfully!", "success");
        console.log("User role:", res.data.user.role);

        // Redirect based on role
        if (res.data.user.role === "admin" || res.data.user.role === "staff") {
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        } else if (res.data.user.role === "student") {
          setTimeout(() => {
            navigate("/student/dashboard");
          }, 1500);
        } else {
          showSnackbar(res.data.message, "error");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
        setLoading(false);
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data.error;
        showSnackbar(message, "error");
      } else {
        showSnackbar("Server Unreachable!", "error");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          backgroundImage:
            "url('" + backgroundImage + "')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            width: 400,
            bgcolor: "rgba(255, 255, 255, 0.9)", // semi-transparent white
            boxShadow: 5,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              component="div"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              Maduka University CBT V3.0
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Email or Matric No"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "#2C2C78",
                  ":hover": { bgcolor: "#1f1f5c" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
