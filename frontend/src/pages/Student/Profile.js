import React, { useState, useEffect } from "react";
import {getProfile} from "../../api/students";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Snackbar, Alert,
} from "@mui/material";
import mulogo from "../../assets/maduka-logo.png";

export default function StudentProfile() {
  const [profileData, setProfileData] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
      function showSnackbar(message, severity) {
        setSnackbar({ open: true, message, severity });
      }
      const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      }



   useEffect(() => {
      getProfile()
        .then(res => {
          setProfileData(res.data.user || []);
        })
        .catch((error=> {
         showSnackbar(error.response.data.message, "error");
        }));
    }, []);


  return (
    <>
    <Container sx={{ mt: 4, px: { xs: 1, sm: 2 }, maxWidth: { xs: '100%', sm: 500 } }}>
      {/* Profile Picture */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
        <Avatar
          src={mulogo}
          alt="Profile"
          sx={{ width: 100, height: 100, mb: 1 }}
        />
      </Box>

      {/* Profile Info (Responsive) */}
      <Box sx={{ textAlign: "left", maxWidth: 400, mx: "auto", px: { xs: 1, sm: 0 } }}>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Full Name:</strong> {profileData.fullName}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Matric No:</strong> {profileData.matric}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>School:</strong> {profileData.school}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Department:</strong> {profileData.department}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Email:</strong> {profileData.email}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Phone:</strong> {profileData.phone}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Level:</strong> {profileData.level}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      </Box>
    </Container>
    <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
           anchorOrigin={{ vertical: "top", horizontal: "center" }}
           >
             <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                   {snackbar.message}
            </Alert>
          </Snackbar>
    </>
  );
}