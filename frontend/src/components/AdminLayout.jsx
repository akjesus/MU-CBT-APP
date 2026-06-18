import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Typography,
  AppBar,
  IconButton,
  Divider,
} from "@mui/material";

import {
  Dashboard,
  People,
  Book,
  School,
  BarChart,
  Logout,
  Menu,
  BookOnline,
  AccountCircle,
} from "@mui/icons-material";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

const getMenuItems = (role) => {
  if (role === "superadmin" || role === "admin") {
    return [
      { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
      { text: "Students", icon: <People />, path: "/admin/students" },
      { text: "Exams", icon: <Book />, path: "/admin/exams" },
      {
        text: "Monitor Exams",
        icon: <BookOnline />,
        path: "/admin/monitoring",
      },
      { text: "Faculties", icon: <School />, path: "/admin/faculties" },
      { text: "Results", icon: <BarChart />, path: "/admin/results" },
      { text: "Staff", icon: <People />, path: "/admin/staff" },
    ];
  }

  if (role === "staff") {
    return [
      { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
      { text: "Students", icon: <People />, path: "/admin/students" },
      { text: "Exams", icon: <Book />, path: "/admin/exams" },
      {
        text: "Monitor Exams",
        icon: <BookOnline />,
        path: "/admin/monitoring",
      },
      { text: "Results", icon: <BarChart />, path: "/admin/results" },
      { text: "Faculties", icon: <School />, path: "/admin/faculties" },
    ];
  }

  return [];
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const menuItems = getMenuItems(role);
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleLogout = () => {
    showSnackbar("Logging out...", "info");
    localStorage.clear();
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const drawerContent = (
    <>
      <Toolbar />

      {/* Logo / Profile */}
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          px: 2,
        }}
      >
        <Avatar
          sx={{
            width: 70,
            height: 70,
            mx: "auto",
            mb: 1,
            bgcolor: "#fff",
            color: "#2C2C78",
          }}
        >
          <AccountCircle sx={{ fontSize: 50 }} />
        </Avatar>

        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: 700,
          }}
        >
          CBT Admin
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {user?.first_name}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />

      {/* Menu */}
      <List sx={{ px: 1, mt: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 1,
                borderRadius: 3,

                background: active
                  ? "linear-gradient(135deg,#ffffff,#f4f6ff)"
                  : "transparent",

                color: active ? "#2C2C78" : "#fff",

                "&:hover": {
                  background: active
                    ? "linear-gradient(135deg,#ffffff,#f4f6ff)"
                    : "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "#2C2C78" : "#fff",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            py: 1.4,
            borderRadius: 3,
            bgcolor: "#fff",
            color: "#2C2C78",
            fontWeight: 700,

            "&:hover": {
              bgcolor: "#f5f5f5",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </>
  );

  return (
    <>
      <Box sx={{ display: "flex" }}>
        {/* HEADER */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            color: "#111",
            borderBottom: "1px solid #eee",
            zIndex: 1300,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
              }}
            >
              <Menu />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#2C2C78",
              }}
            >
              CBT Administration
            </Typography>
          </Toolbar>
        </AppBar>

        {/* MOBILE DRAWER */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: "linear-gradient(180deg,#2C2C78 0%, #4338CA 100%)",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* DESKTOP DRAWER */}
        <Drawer
          variant="permanent"
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            width: drawerWidth,

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: "linear-gradient(180deg,#2C2C78 0%, #4338CA 100%)",
              border: 0,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            bgcolor: "#f8fafc",
            p: 3,
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
