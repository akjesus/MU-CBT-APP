import React, { useEffect, useState } from "react";
import { getSchools, addSchool, updateSchool, deleteSchool } from "../../api/schools";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from "../../api/departments";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Pagination,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";

export default function SchoolsPage() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [schools, setSchools] = useState([]);
  const [editingSchool, setEditingSchool] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [deptPage, setDeptPage] = useState(1);
  const [deptRowsPerPage] = useState(10);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Tabs
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await getSchools();
        setSchools(res.data.schools)
        showSnackbar("Schools Fetched!")
      }
      catch(error) {
        showSnackbar(`${error.response?.data?.message || "Failed to fetch schools"}`, "error");
        console.log(error)
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (tab === 1) {
      const fetchDepartments = async () => {
        try {
          const res = await getDepartments();
          setDepartments(res.data.departments)
          showSnackbar("Departments Fetched!")
        }
        catch(error) {
          showSnackbar(`${error.response?.data?.message || "Failed to fetch departments"}`, "error");
          console.log(error)
        }
      };
      fetchDepartments();
    }
  }, [tab]);

  // School form submit
  const onSubmit = async(data) => {
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, data);
        reset();
        showSnackbar("School updated successfully!", "success");
        setEditingSchool(null);
        setOpenDialog(false);
        const res = await getSchools();
        setSchools(res.data.schools)
      } else{
        await addSchool(data)
        reset();
        showSnackbar("School added successfully!");
        setOpenDialog(false);
        const res = await getSchools();
        setSchools(res.data.schools)
      }
    }
    catch(error) {
      showSnackbar(error.response.data.message || "There was an error", "error")
    }
  };

  // Department form submit
  const onDeptSubmit = async(data) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, data);
        reset();
        showSnackbar("Department updated successfully!", "success");
        setEditingDepartment(null);
        setOpenDeptDialog(false);
        const res = await getDepartments();
        setDepartments(res.data.departments)
      } else{
        await addDepartment(data)
        reset();
        showSnackbar("Department added successfully!");
        setOpenDeptDialog(false);
        const res = await getDepartments();
        setDepartments(res.data.departments)
      }
    }
    catch(error) {
      showSnackbar(error.response.data.message || "There was an error", "error")
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setValue("name", school.name);
    setOpenDialog(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setValue("name", department.name);
    setOpenDeptDialog(true);
  };

  const handleDelete =  async (id) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await deleteSchool(id)
        showSnackbar("School deleted successfully!", "success");
        const res = await getSchools();
        setSchools(res.data.schools)
      }
      catch(error) {
        showSnackbar(error.response.data.message || "There was an error", "error")
        console.log(error);
      } 
    }
    return
  };

  const handleDeleteDepartment =  async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id)
        showSnackbar("Department deleted successfully!", "success");
        const res = await getDepartments();
        setDepartments(res.data.departments)
      }
      catch(error) {
        showSnackbar(error.response.data.message || "There was an error", "error")
        console.log(error);
      } 
    }
    return
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tabs handler
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  // Filtered & paginated schools
  const filtered = schools.filter(school => school.name.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(filtered.length / rowsPerPage);

  // Filtered & paginated departments
  const deptFiltered = departments.filter(dept => dept.name.toLowerCase().includes(deptSearch.toLowerCase()));
  const deptPaginated = deptFiltered.slice((deptPage - 1) * deptRowsPerPage, deptPage * deptRowsPerPage);
  const deptPageCount = Math.ceil(deptFiltered.length / deptRowsPerPage);

  return (
    <>
      <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
          Manage Schools & Departments
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={handleChangeTab} aria-label="schools-departments-tabs" variant="fullWidth">
            <Tab label="Schools" />
            <Tab label="Departments" />
          </Tabs>
        </Box>

        {/* Schools Tab */}
        {tab === 0 && (
          <>
            {/* Search + Add Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <TextField
                placeholder="Search School"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
              >
                Add School
              </Button>
            </Box>

            {/* Schools Table */}
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map(school => (
                    <TableRow key={school.id}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 90, maxWidth: 120, p: { xs: 0.5, sm: 1 }, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                            onClick={() => handleEdit(school)}
                            aria-label="Edit School"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                            onClick={() => handleDelete(school.id)}
                            aria-label="Delete School"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">No schools found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            {/* Pagination */}
            {pageCount > 1 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}

            {/* School Form Dialog */}
            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingSchool(null); }}>
              <DialogTitle>{editingSchool ? "Edit School" : "Add School"}</DialogTitle>
              <DialogContent>
                <form id="school-form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="School Name"
                    {...register("name", { required: true })}
                    sx={{ mt: 2 }}
                  />
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenDialog(false); setEditingSchool(null); }}>Cancel</Button>
                <Button type="submit" form="school-form" variant="contained" color="primary">
                  {editingSchool ? "Update" : "Add"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Departments Tab */}
        {tab === 1 && (
          <>
            {/* Search + Add Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <TextField
                placeholder="Search Department"
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => setOpenDeptDialog(true)}
              >
                Add Department
              </Button>
            </Box>

            {/* Departments Table */}
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Faculty</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deptPaginated.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                     <TableCell>{dept.school}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 90, maxWidth: 120, p: { xs: 0.5, sm: 1 }, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                            onClick={() => handleEditDepartment(dept)}
                            aria-label="Edit Department"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                            onClick={() => handleDeleteDepartment(dept.id)}
                            aria-label="Delete Department"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deptPaginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">No departments found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            {/* Pagination */}
            {deptPageCount > 1 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={deptPageCount}
                  page={deptPage}
                  onChange={(e, value) => setDeptPage(value)}
                  color="primary"
                />
              </Box>
            )}

            {/* Department Form Dialog */}
           <Dialog open={openDeptDialog} onClose={() => { setOpenDeptDialog(false); setEditingDept(null); }}>
        <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogContent>
          <form id="department-form" onSubmit={handleSubmit(onDeptSubmit)}>
            <TextField
              fullWidth
              label="Department Name"
              {...register("name", { required: true })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Faculty</InputLabel>
              <Select {...register("school", { required: true })} defaultValue={editingDept?.school || ""}>
                {schools.map(school => (
                  <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeptDialog(false); setEditingDept(null); }}>Cancel</Button>
          <Button type="submit" form="department-form" variant="contained" color="primary">
            {editingDept ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
          </>
        )}

        {/* Snackbar */}
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
      </Box>
    </>
  );
}
