import {
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TextField,
  TableCell,
  TableBody,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Alert,
  Snackbar,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getStaff,
  deleteStaff,
  createStaff,
  resetPassword,
  updateStaff,
  changePassword,
} from "../../api/staff";
import {
  Edit,
  Delete,
  Visibility,
  LockReset,
  VisibilityOff,
} from "@mui/icons-material";

export default function StaffSettings() {
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });
  const [userRole, setUserRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [changeOpen, setChangeOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateOpen = () => {
    setCreateModalOpen(true);
    setNewStaff({ first_name: "", last_name: "", email: "", role: "" });
  };
  const handleCreateClose = () => {
    setCreateModalOpen(false);
  };
  const handleCreateSave = async () => {
    try {
      const res = await createStaff(newStaff);
      if (res.data.success) {
        const res = await getStaff();
        setStaff(res.data.staff);
        showSnackbar("Staff created successfully", "success");
        setCreateModalOpen(false);
        return;
      } else {
        showSnackbar(res.data.message || "Failed to create staff", "error");
        return;
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Error creating staff",
        "error",
      );
      return;
    }
  };

  const handleResetPassword = async (staffMember) => {
    if (
      window.confirm(
        `Reset password for ${staffMember.first_name} ${staffMember.last_name}?`,
      )
    ) {
      try {
        const res = await resetPassword(staffMember);
        if (res.data.success) {
          showSnackbar("Password reset successfully");
          return;
        } else {
          showSnackbar(res.data.message || "Failed to reset password", "error");
          return;
        }
      } catch (error) {
        showSnackbar(
          error.response?.data?.message || "Error resetting password",
          "error",
        );
      }
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getStaff();
        setStaff(res.data.staff);
        showSnackbar("All staff fetched!");
      } catch (error) {
        showSnackbar(
          error.response.data.message || "There was an error fetching Staff",
          "error",
        );
        setStaff([]);
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const role = localStorage.getItem("role");
        setUserRole(role);
      } catch (error) {
        console.error("Failed to fetch user role", error);
      }
    };
    fetchUserRole();
  }, []);

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStaff(null);
  };

  const handleModalSave = async () => {
    if (!selectedStaff) {
      return;
    }
    try {
      const res = await updateStaff(selectedStaff, selectedStaff.id);
      if (res.data.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === selectedStaff.id ? selectedStaff : s)),
        );
        showSnackbar("Staff updated successfully");
        setModalOpen(false);
        setSelectedStaff(null);
        return;
      } else {
        showSnackbar(res.data.message || "Failed to update staff", "error");
        return;
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Error updating staff",
        "error",
      );
      return;
    }
  };

  const handleDelete = async (staffMember) => {
    if (
      window.confirm(`Delete staff: ${staffMember.name || staffMember.email}?`)
    ) {
      try {
        const res = await deleteStaff(staffMember.id);
        if (res.data.success) {
          setStaff(staff.filter((s) => s.id !== staffMember.id));
          showSnackbar("Staff deleted successfully");
          return;
        } else {
          showSnackbar(res.data.message || "Failed to delete staff", "error");
          return;
        }
      } catch (error) {
        showSnackbar(
          error.response?.data?.message || "Error deleting staff",
          "error",
        );
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showSnackbar("New password and confirm password do not match", "error");
      return;
    }
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.data.success) {
        showSnackbar("Password changed successfully", "success");
        setChangeOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return;
      } else {
        showSnackbar(res.data.message || "Failed to change password", "error");
        return;
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Error changing password",
        "error",
      );
    }
  };

  return (
    <>
      <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2C2C78",
            fontSize: { xs: 18, sm: 24 },
          }}
        >
          Manage Staff
        </Typography>
        {(userRole === "admin" || userRole === "superadmin") && (
          <Button
            variant="contained"
            sx={{ mb: 2, bgcolor: "#2C2C78" }}
            onClick={handleCreateOpen}
          >
            Add New Staff
          </Button>
        )}
        {/* Create New Staff Modal */}
        <Dialog
          open={createModalOpen}
          onClose={handleCreateClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Staff</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                sx={{ mt: 1 }}
                label="First Name"
                value={newStaff.first_name}
                fullWidth
                onChange={(e) =>
                  setNewStaff({ ...newStaff, first_name: e.target.value })
                }
              />

              <TextField
                sx={{ mt: 1 }}
                label="Last Name"
                value={newStaff.last_name}
                fullWidth
                onChange={(e) =>
                  setNewStaff({ ...newStaff, last_name: e.target.value })
                }
              />
              <TextField
                label="Username"
                value={newStaff.username}
                fullWidth
                sx={{ mt: 1 }}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, username: e.target.value })
                }
              />
              <TextField
                sx={{ mt: 1 }}
                label="Email"
                value={newStaff.email}
                fullWidth
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  sx={{ mt: 1 }}
                  label="Role"
                  value={newStaff.role || ""}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      role: e.target.value,
                    })
                  }
                >
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateClose}>Cancel</Button>
            <Button onClick={handleCreateSave} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <Button
          variant="contained"
          sx={{ mb: 2, ml: 2 }}
          onClick={() => setChangeOpen(true)}
        >
          Change Password
        </Button>
        <Dialog
          open={changeOpen}
          onClose={() => setChangeOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                sx={{ color: "success" }}
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                label="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                slotProps={{
                  input: {
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
                  },
                }}
              />
              <TextField
                sx={{ mt: 1 }}
                label="New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                slotProps={{
                  input: {
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
                  },
                }}
              />
              <TextField
                sx={{ mt: 1 }}
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
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
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangeOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Change
            </Button>
          </DialogActions>
        </Dialog>

        {/* Staff Table */}

        <Table sx={{ minWidth: 320, width: "100%", overflowX: "auto", mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((s, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {s.first_name} {s.last_name}
                </TableCell>
                <TableCell>{s.username || "-"}</TableCell>
                <TableCell>{s.email || "-"}</TableCell>
                <TableCell>{s.role || "-"}</TableCell>

                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {userRole === "admin" ||
                      (userRole === "superadmin" && (
                        <>
                          <Tooltip title="View" arrow>
                            <IconButton
                              disabled={s.role === "superadmin"}
                              color="primary"
                              onClick={() => handleView(s)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              disabled={s.role === "superadmin"}
                              color="secondary"
                              onClick={() => handleEdit(s)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(s)}
                              disabled={s.role === "superadmin"}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password" arrow>
                            <IconButton
                              disabled={s.role === "superadmin"}
                              color="info"
                              onClick={() => handleResetPassword(s)}
                            >
                              <LockReset fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {staff.length === 0 && (
          <Typography color="text.secondary" align="center">
            No staff found.
          </Typography>
        )}

        {/* Staff View/Edit Modal */}
        <Dialog
          open={modalOpen}
          onClose={handleModalClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {modalMode === "edit" ? "Edit Staff" : "View Staff"}
          </DialogTitle>
          <DialogContent>
            {selectedStaff && (
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TextField
                  sx={{ mt: 2 }}
                  label="First Name"
                  value={selectedStaff.first_name || ""}
                  fullWidth
                  InputProps={{ readOnly: modalMode === "view" }}
                  onChange={(e) => {
                    if (modalMode === "edit")
                      setSelectedStaff({
                        ...selectedStaff,
                        first_name: e.target.value,
                      });
                  }}
                />
                <TextField
                  sx={{ mt: 2 }}
                  label="Last Name"
                  value={selectedStaff.last_name || ""}
                  fullWidth
                  InputProps={{ readOnly: modalMode === "view" }}
                  onChange={(e) => {
                    if (modalMode === "edit")
                      setSelectedStaff({
                        ...selectedStaff,
                        last_name: e.target.value,
                      });
                  }}
                />
                <TextField
                  sx={{ mt: 2 }}
                  label="Username"
                  value={selectedStaff.username || ""}
                  fullWidth
                  InputProps={{ readOnly: modalMode === "view" }}
                  onChange={(e) => {
                    if (modalMode === "edit")
                      setSelectedStaff({
                        ...selectedStaff,
                        username: e.target.value,
                      });
                  }}
                />
                <TextField
                  sx={{ mt: 2 }}
                  label="Email"
                  value={selectedStaff.email || ""}
                  fullWidth
                  InputProps={{ readOnly: modalMode === "view" }}
                  onChange={(e) => {
                    if (modalMode === "edit")
                      setSelectedStaff({
                        ...selectedStaff,
                        email: e.target.value,
                      });
                  }}
                />
                {modalMode === "edit" ? (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      sx={{ mt: 1 }}
                      label="Role"
                      value={selectedStaff.role || ""}
                      onChange={(e) =>
                        setSelectedStaff({
                          ...selectedStaff,
                          role: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    sx={{ mt: 2 }}
                    label="Role"
                    value={selectedStaff.role || ""}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Close</Button>
            {modalMode === "edit" && (
              <Button onClick={handleModalSave} variant="contained">
                Save
              </Button>
            )}
          </DialogActions>
        </Dialog>
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
}
