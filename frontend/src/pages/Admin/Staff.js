import { 
  Typography, 
  Box, 
  Table, 
  TableHead, 
  TableRow, 
  TextField, 
  TableCell, 
  TableBody, 
  IconButton, 
  Tooltip, 
  Button,
Dialog,
DialogTitle,
DialogActions,
DialogContent,
Alert,
Snackbar, } from "@mui/material";
import { useEffect, useState } from "react";
import { getStaff, deleteStaff, createStaff, resetPassword, updateStaff } from "../../api/staff";
import { Edit, Delete, Visibility, LockReset } from "@mui/icons-material";

export default function StaffSettings() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
      function showSnackbar(message, severity) {
        setSnackbar({ open: true, message, severity });
      }
    
      const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      };
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ first_name: '', last_name: '', email: '', role: '' });
  const handleCreateOpen = () => {
    setCreateModalOpen(true);
    setNewStaff({ first_name: '', last_name: '', email: '', role: '' });
  };
  const handleCreateClose = () => {
    setCreateModalOpen(false);
  };
  const handleCreateSave = async () => {
    try {
      const res = await createStaff(newStaff);
      if(res.data.success) {
        setStaff(prev => [...prev, res.data.staff]);
        showSnackbar('Staff created successfully');
        setCreateModalOpen(false);
        return;
      }
      else {
        showSnackbar(res.data.message || 'Failed to create staff', "error");
        return;
      }

    }
    catch(error) {
      showSnackbar(error.response?.data?.message || 'Error creating staff', "error");
      return;
    } 
  };

  const handleResetPassword = async (staffMember) => {
    if (window.confirm(`Reset password for ${staffMember.first_name} ${staffMember.last_name}?`)) {
      try {
        const res = await resetPassword(staffMember.id);
        if(res.data.success) {
          showSnackbar('Password reset successfully');
          return;
        }
        else {
          showSnackbar(res.data.message || 'Failed to reset password');
          return;
        }
      }
      catch(error) {
        showSnackbar(error.response?.data?.message || 'Error resetting password,"error');
      }
    }
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  useEffect(() => {
    getStaff()
      .then(res => {
        setStaff(res.data.staff);
        showSnackbar("All staff fetched!")
      })
      .catch((error) => {
        showSnackbar(error.response.data.message || "There was an error fetching Staff", "error");
        setStaff([])
      });
  }, []);

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStaff(null);
  };

  const handleModalSave = async () => {
      if(!selectedStaff) {
        return;}
    try {
      const res = await updateStaff(selectedStaff, selectedStaff.id);
      if(res.data.success) {
        setStaff(prev => prev.map(s => s.id === selectedStaff.id ? selectedStaff : s));
        showSnackbar('Staff updated successfully');
        setModalOpen(false);
        setSelectedStaff(null);
        return;
      }
      else {
        showSnackbar(res.data.message || 'Failed to update staff', "error");
        return;
      }

    }
    catch(error) {
      showSnackbar(error.response?.data?.message || 'Error updating staff', "error");
      return;
    }
    
  };

  const handleDelete = async (staffMember) => {
    if (window.confirm(`Delete staff: ${staffMember.name || staffMember.email}?`)) {
      try {
        const res = await deleteStaff(staffMember.id);
        if(res.data.success) {
          setStaff(staff.filter(s => s.id !== staffMember.id));
          showSnackbar('Staff deleted successfully');
          return;
        }
        else {
          showSnackbar(res.data.message || 'Failed to delete staff', "error");
          return;
        }
      }
      catch(error) {
        showSnackbar(error.response?.data?.message || 'Error deleting staff', "error");
      }
    }
  };

  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
         Manage Staff
      </Typography>
      <Button variant="contained" sx={{ mb: 2, bgcolor: '#2C2C78' }} onClick={handleCreateOpen}>Add New Staff</Button>
      {/* Create New Staff Modal */}
      <Dialog open={createModalOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Staff</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
              label="First Name"
              value={newStaff.first_name}
              fullWidth
              onChange={e => setNewStaff({ ...newStaff, first_name: e.target.value })}
            />
            
            <TextField
              label="Last Name"
              value={newStaff.last_name}
              fullWidth
              onChange={e => setNewStaff({ ...newStaff, last_name: e.target.value })}
            />
            <TextField
              label="Username"
              value={newStaff.username}
              fullWidth
              onChange={e => setNewStaff({ ...newStaff, username: e.target.value })}
            />
            <TextField
              label="Email"
              value={newStaff.email}
              fullWidth
              onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
            />
            <TextField
              label="Role"
              select
              value={newStaff.role}
              fullWidth
              onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Select Role</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleCreateSave} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      
      <Table sx={{ minWidth: 320, width: '100%', overflowX: 'auto', mb: 2 }}>
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
              <TableCell>{s.first_name} {s.last_name}</TableCell>
              <TableCell>{s.username || '-'}</TableCell>
              <TableCell>{s.email || '-'}</TableCell>
              <TableCell>{s.role || '-'}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                  <Tooltip title="View" arrow>
                    <IconButton color="primary" onClick={() => handleView(s)}><Visibility fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <IconButton color="secondary" onClick={() => handleEdit(s)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <IconButton color="error" onClick={() => handleDelete(s)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password" arrow>
                    <IconButton color="info" onClick={() => handleResetPassword(s)}><LockReset fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {staff.length === 0 && (
        <Typography color="text.secondary" align="center">No staff found.</Typography>
      )}

      {/* Staff View/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === 'edit' ? 'Edit Staff' : 'View Staff'}</DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              
              <TextField
                label="First Name"
                value={selectedStaff.first_name || ''}
                fullWidth
                InputProps={{ readOnly: modalMode === 'view' }}
                onChange={e => {
                  if (modalMode === 'edit') setSelectedStaff({ ...selectedStaff, first_name: e.target.value });
                }}
              />
              <TextField
                label="Last Name"
                value={selectedStaff.last_name || ''}
                fullWidth
                InputProps={{ readOnly: modalMode === 'view' }}
                onChange={e => {
                  if (modalMode === 'edit') setSelectedStaff({ ...selectedStaff, last_name: e.target.value });
                }}
              />
              <TextField
                label="Username"
                value={selectedStaff.username || ''}
                fullWidth
                InputProps={{ readOnly: modalMode === 'view' }}
                onChange={e => {
                  if (modalMode === 'edit') setSelectedStaff({ ...selectedStaff, username: e.target.value });
                }}
              />
              <TextField
                label="Email"
                value={selectedStaff.email || ''}
                fullWidth
                InputProps={{ readOnly: modalMode === 'view' }}
                onChange={e => {
                  if (modalMode === 'edit') setSelectedStaff({ ...selectedStaff, email: e.target.value });
                }}
              />
              {modalMode === 'edit' ? (
                <TextField
                  label="Role"
                  select
                  value={selectedStaff.role || ''}
                  fullWidth
                  onChange={e => setSelectedStaff({ ...selectedStaff, role: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Role</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </TextField>
              ) : (
                <TextField
                  label="Role"
                  value={selectedStaff.role || ''}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Close</Button>
          {modalMode === 'edit' && <Button onClick={handleModalSave} variant="contained">Save</Button>}
        </DialogActions>
      </Dialog>
    </Box>
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
