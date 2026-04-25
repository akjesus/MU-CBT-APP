import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  TablePagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, UploadFile, LockReset } from "@mui/icons-material";
import { getFaculties, getLevels } from "../../api/faculties";
import { getDepartments } from "../../api/departments";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
  getStudentsForDepartment,
  resetStudentPassword,
} from "../../api/students";

export default function AdminStudents() {
  // Fetch students from API and setStudents
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newStudent, setNewStudent] = useState({
    matric: "",
    faculty: "",
    department: "",
    level: "",
    email: "",
    username: "",
    facultyId: "",
    departmentId: "",
    first_name: "",
    last_name: "",
    levelId: "",
  });
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [studentsFetched, setStudentsFetched] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tab, setTab] = useState(0);
  const handleBulkUpload = async (event) => {
    setUploading(true);
    try {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await bulkUploadStudents(formData);
      if (res.data.success) {
        showSnackbar(res.data?.message || "Bulk upload successful!", "success");
      } else {
        showSnackbar("Bulk upload failed, check server logs!", "info");
      }
    } catch (err) {
      showSnackbar("Bulk upload failed!", "error");
      console.log(err);
    }
    setUploading(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tab change handler
  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  const handleResetPassword = async (student) => {
    if (
      window.confirm(
        `Are you sure you want to reset the password for ${student.name || student.matric}?`,
      )
    ) {
      try {
        await resetStudentPassword(student.id);
        showSnackbar(
          `Password reset for ${student.name || student.matric}`,
          "success",
        );
      } catch (err) {
        console.log(err);
        showSnackbar(
          err.response?.data?.message || "Failed to reset password",
          "error",
        );
      }
    }
  };
  // Fetch faculties & departments
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const facultiesRes = await getFaculties();
      const departmentsRes = await getDepartments();
      const levelsRes = await getLevels();
      setFaculties(facultiesRes.data.faculties);
      setDepartments(departmentsRes.data.departments);
      setLevels(levelsRes.data.levels);
    } catch (error) {
      setSnackbar("Error fetching data: " + error.message, "error");
      setFaculties([]);
      setDepartments([]);
      setLevels([]);
    }
  };
  const handleFetchStudents = async () => {
    if (!selectedFaculty || !selectedDepartment || !selectedLevel) {
      showSnackbar("All fields required!", "error");
      return;
    }
    try {
      const res = await getStudentsForDepartment(
        selectedDepartment,
        selectedLevel,
      );
      if (res.data.students < 1) {
        showSnackbar("No students found for the selected criteria", "info");
        setStudents([]);
      } else {
        showSnackbar(`Students retrieved`, "success");
        setStudents(res.data.students);
      }
    } catch (error) {
      console.log(error);
      showSnackbar(error.response?.data?.message || error, "error");
    }
  };
  const handleOpenEdit = (student, index) => {
    console.log(student);
    setNewStudent(student);
    setEditIndex(index);
    setOpenEdit(true);
  };
  const handleOpen = () => {
    setNewStudent({
      first_name: "",
      last_name: "",
      matric: "",
      faculty: "",
      department: "",
      level: "",
      email: "",
      username: "",
      facultyId: "",
      departmentId: "",
    });
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpenEdit(false);
  };
  const handleChange = (e) =>
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  const handleLevelChange = (event) => {
    setNewStudent({ ...newStudent, levelId: event.target.value });
  };

  const handleDepartmentChange = (event) => {
    setNewStudent({ ...newStudent, departmentId: event.target.value });
  };
  const handleSaveStudent = async () => {
    try {
      const res = await createStudent(newStudent);
      if (res.status === 201) {
        showSnackbar("Student added successfully", "success");
        setTimeout(() => {
          handleClose();
        }, 2500);
        return;
      } else {
        showSnackbar("Failed to add student", "error");
      }
    } catch (error) {
      console.log(error);
      showSnackbar(error.response?.data?.message || error.message, "error");
    }

    handleClose();
  };

  const handleDelete = async (student, index) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      const updated = students.filter((_, i) => i !== index);
      try {
        const res = await deleteStudent(student.id);
        if (res.status === 200) {
          showSnackbar("Student deleted successfully", "success");
          setStudents(updated);
        } else {
          showSnackbar("Failed to delete student", "error");
        }
      } catch (error) {
        console.log(error);
        showSnackbar(error.response?.data?.message || error.message, "error");
      }
    }
  };

  const handleEditSaveStudent = async () => {
    try {
      const res = await updateStudent(newStudent);
      if (res.status === 200) {
        showSnackbar("Student updated successfully", "success");
        handleClose();
        setStudents([...students, newStudent]);
      } else {
        showSnackbar("Failed to update student", "error");
      }
    } catch (error) {
      console.log(error);
      showSnackbar(
        error.response?.data?.message?.message ||
          error.response.data.message ||
          error.message,
        "error",
      );
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Box
        p={{ xs: 1, sm: 3 }}
        sx={{
          maxWidth: 900,
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2C2C78",
            fontSize: { xs: 18, sm: 24 },
            textAlign: { xs: "center", sm: "left" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          Manage Students
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            aria-label="students tabs"
            variant="fullWidth"
            sx={{ maxWidth: 900 }}
          >
            <Tab label="View Students" />
            <Tab label="Add Students" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            ></Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <FormControl
                sx={{ minWidth: 220, width: { xs: "100%", sm: 220 } }}
                size="small"
              >
                <InputLabel>Faculty</InputLabel>
                <Select
                  value={selectedFaculty}
                  label="Faculty"
                  onChange={(e) => {
                    setSelectedFaculty(e.target.value);
                    setSelectedDepartment("");
                    setSelectedLevel("");
                    setStudents([]);
                    setStudentsFetched(false);
                  }}
                >
                  <MenuItem value="">Select Faculty</MenuItem>
                  {faculties.map((fac) => (
                    <MenuItem key={fac.id} value={fac.id}>
                      {fac.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                sx={{ minWidth: 220, width: { xs: "100%", sm: 220 } }}
                size="small"
                disabled={!selectedFaculty}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedLevel("");
                    setStudents([]);
                    setStudentsFetched(false);
                  }}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments
                    .filter((dep) => dep.faculty_id === selectedFaculty)
                    .map((dep) => (
                      <MenuItem key={dep.id} value={dep.id}>
                        {dep.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl
                sx={{ minWidth: 220, width: { xs: "100%", sm: 220 } }}
                size="small"
              >
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Level"
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setStudents([]);
                    setStudentsFetched(false);
                  }}
                >
                  <MenuItem value="">Select Level</MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#2C2C78",
                  width: { xs: "100%", sm: "auto" },
                  mt: { xs: 1, sm: 0 },
                }}
                onClick={handleFetchStudents}
                disabled={
                  !selectedFaculty || !selectedDepartment || !selectedLevel
                }
              >
                Get Students
              </Button>
            </Box>

            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <TextField
                label="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ width: { xs: "100%", sm: 300 } }}
              />
            </Box>

            {/* Students Table */}
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 320, width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>S/No</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Matric Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>
                          {student.registration_number}
                        </TableCell>
                        <TableCell sx={{ width: "20%" }}>
                          {student.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 70,
                            maxWidth: 90,
                            p: { xs: 0.25, sm: 0.5 },
                            overflow: "hidden",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                              flexWrap: { xs: "wrap", sm: "nowrap" },
                            }}
                          >
                            <Tooltip title="Edit Student" arrow>
                              <IconButton
                                color="primary"
                                size="small"
                                sx={{
                                  bgcolor: "#e3e3fa",
                                  borderRadius: 2,
                                  p: 0.25,
                                  boxShadow: 1,
                                  ":hover": { bgcolor: "#d1d1f7" },
                                }}
                                onClick={() => handleOpenEdit(student, index)}
                                aria-label="Edit Student"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Student" arrow>
                              <IconButton
                                color="error"
                                size="small"
                                sx={{
                                  bgcolor: "#fdecea",
                                  borderRadius: 2,
                                  p: 0.25,
                                  boxShadow: 1,
                                  ":hover": { bgcolor: "#f9d6d5" },
                                }}
                                onClick={() => handleDelete(student, index)}
                                aria-label="Delete Student"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Password" arrow>
                              <IconButton
                                color="secondary"
                                size="small"
                                sx={{
                                  bgcolor: "#e3f2fd",
                                  borderRadius: 2,
                                  p: 0.25,
                                  boxShadow: 1,
                                  ":hover": { bgcolor: "#bbdefb" },
                                }}
                                onClick={() => handleResetPassword(student)}
                                aria-label="Reset Password"
                              >
                                <LockReset fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
            <Dialog
              open={openEdit}
              onClose={() => setOpenEdit(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle sx={{ fontSize: { xs: 18, sm: 22 } }}>
                {"Edit Student"}
              </DialogTitle>
              <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <TextField
                      margin="dense"
                      label="First Name"
                      name="first_name"
                      fullWidth
                      value={newStudent.first_name}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <TextField
                      margin="dense"
                      label="Last Name"
                      name="last_name"
                      fullWidth
                      value={newStudent.last_name}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                  <TextField
                    margin="dense"
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    value={newStudent.email}
                    onChange={handleChange}
                    size="small"
                  />
                  <TextField
                    margin="dense"
                    label="Username"
                    name="username"
                    fullWidth
                    value={newStudent.username}
                    onChange={handleChange}
                    size="small"
                  />
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Faculty</InputLabel>
                      <Select
                        name="faculty"
                        value={newStudent.faculty}
                        onChange={handleChange}
                        label="Faculty"
                      >
                        {faculties.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={newStudent.departmentId}
                        onChange={handleDepartmentChange}
                        label="Department"
                      >
                        {departments
                          .filter((d) => d.faculty_id === newStudent.facultyId)
                          .map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              {d.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Level</InputLabel>
                      <Select
                        name="level"
                        value={newStudent.levelId}
                        onChange={handleLevelChange}
                        label="Level"
                      >
                        {levels.map((l) => (
                          <MenuItem key={l.id} value={l.id}>
                            {l.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      margin="dense"
                      label="Matric NO"
                      name="matric"
                      type="text"
                      fullWidth
                      value={newStudent.matric}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2C2C78" }}
                  onClick={handleEditSaveStudent}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
            <TablePagination
              component="div"
              count={filteredStudents.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                ".MuiTablePagination-toolbar": {
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1, sm: 0 },
                  px: { xs: 0, sm: 2 },
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontSize: { xs: 13, sm: 15 },
                  },
              }}
            />
          </>
        )}

        {tab === 1 && (
          <>
            {/* Bulk Upload Tab */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mb: 2,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <Paper sx={{ p: 2, width: "100%" }}>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>
                  Bulk Upload (CSV)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Upload a CSV file with student records.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#2C2C78",
                      ":hover": { bgcolor: "#1f1f5c" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                    onClick={() => handleOpen()}
                  >
                    Add Student
                  </Button>

                  <Button
                    startIcon={<UploadFile />}
                    variant="contained"
                    component="label"
                    sx={{
                      bgcolor: uploading ? "#d1d1f7" : "#2C2C78",
                      color: uploading ? "#000" : "#fff",
                      ":hover": { bgcolor: uploading ? "#c2c2f5" : "#1f1f5c" },
                    }}
                    // disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ color: "#2C2C78", mr: 1 }}
                        />
                        Uploading
                      </>
                    ) : (
                      "Upload Students"
                    )}
                    <input type="file" hidden onChange={handleBulkUpload} />
                  </Button>
                </Box>
              </Paper>
            </Box>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
              <DialogTitle sx={{ fontSize: { xs: 18, sm: 22 } }}>
                {editIndex !== null ? "Edit Student" : "Add Student"}
              </DialogTitle>
              <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <TextField
                      margin="dense"
                      label="First Name"
                      name="first_name"
                      fullWidth
                      value={newStudent.first_name}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                    <TextField
                      margin="dense"
                      label="Last Name"
                      name="last_name"
                      fullWidth
                      value={newStudent.last_name}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                  <TextField
                    margin="dense"
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    value={newStudent.email}
                    onChange={handleChange}
                    size="small"
                  />
                  <TextField
                    margin="dense"
                    label="Username"
                    name="username"
                    fullWidth
                    value={newStudent.username}
                    onChange={handleChange}
                    size="small"
                  />
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Faculty</InputLabel>
                      <Select
                        name="faculty"
                        value={newStudent.faculty}
                        onChange={handleChange}
                        label="Faculty"
                      >
                        {faculties.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={newStudent.department}
                        onChange={handleChange}
                        label="Department"
                      >
                        {departments
                          .filter(
                            (d) =>
                              d.faculty_id ===
                              faculties.find((f) => f.name === newStudent.faculty)
                                ?.id,
                          )
                          .map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              {d.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <FormControl
                      fullWidth
                      margin="dense"
                      sx={{ flex: 1 }}
                      size="small"
                    >
                      <InputLabel>Level</InputLabel>
                      <Select
                        name="level"
                        value={newStudent.level}
                        onChange={handleChange}
                        label="Level"
                      >
                        {levels.map((l) => (
                          <MenuItem key={l.id} value={l.id}>
                            {l.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      margin="dense"
                      label="Matric NO"
                      name="matric"
                      type="text"
                      fullWidth
                      value={newStudent.matric}
                      onChange={handleChange}
                      sx={{ flex: 1 }}
                      size="small"
                    />
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2C2C78" }}
                  onClick={handleSaveStudent}
                >
                  Save
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
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
