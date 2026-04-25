import React, { useState } from "react";

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Paper,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Dashboard,
  People,
  Book,
  School,
  BarChart,
  Logout,
  ChevronLeft,
  ChevronRight,
  PeopleOutline,
  BookOnline,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

const getMenuItems = (role) => {
  if (role === "admin" || role === "staff") {
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
      { text: "Staff", icon: <PeopleOutline />, path: "/admin/staff" },
    ];
  }
  return [];
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [menuItems, setMenuItems] = useState(getMenuItems(role));

  React.useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem("role");
      setRole(newRole);
      setMenuItems(getMenuItems(newRole));
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem("role");
      if (currentRole !== role) {
        setRole(currentRole);
        setMenuItems(getMenuItems(currentRole));
      }
    }, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [role]);

  function showSnackbar(message, severity) {
    setSnackbar({ open: true, message, severity });
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    showSnackbar("Logging Out....", "info");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setTimeout(() => {
      setRole(null);
      setMenuItems([]);
      navigate("/");
    }, 1500);
  };

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 8,
            zIndex: 1300,
            display: { xs: "block", md: "none" },
          }}
        >
          <Button
            variant="contained"
            sx={{ minWidth: 0, p: 1, bgcolor: "#2C2C78" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </Box>
        <Box
          sx={{
            position: "fixed",
            top: 16,
            right: 32,
            zIndex: 1400,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        ></Box>
        <Drawer
          variant={sidebarOpen ? "temporary" : "permanent"}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            display: { xs: sidebarOpen ? "block" : "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: "#87CEEB",
              color: "white",
            },
          }}
        >
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  backgroundColor:
                    location.pathname === item.path ? "#2C2C78" : "transparent",
                  "&:hover": { backgroundColor: "#4682B4" },
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color:
                      location.pathname === item.path ? "white" : undefined,
                    fontWeight:
                      location.pathname === item.path ? 700 : undefined,
                  }}
                />
              </ListItem>
            ))}
          </List>
          {/* Logout button at bottom */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                bgcolor: "#2C2C78",
                ":hover": { bgcolor: "#1f1f5c" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f4f6f8",
            p: { xs: 1, md: 3 },
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 1, md: 3 },
              width: { xs: "100%", md: "90%" },
              minHeight: "80vh",
              borderRadius: 3,
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      </Box>
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
};

export default AdminLayout;
