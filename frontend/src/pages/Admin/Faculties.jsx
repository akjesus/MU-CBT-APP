import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import {
  getFaculties,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  getLevels,
} from "../../api/faculties";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../../api/sessions";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/departments";
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
  Select,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";

export default function FacultiesPage() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [faculties, setFaculties] = useState([]);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [openFacultyDialog, setOpenFacultyDialog] = useState(false);

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  // Courses state
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [deptPage, setDeptPage] = useState(1);
  const [deptRowsPerPage] = useState(10);
  const [coursePage, setCoursePage] = useState(1);
  const [courseRowsPerPage] = useState(10);

  // Notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Confirmation Dialog

  const [openConfirm, setOpenConfirm] = useState({
    open: false,
    title: "",
    data: null,
    message: "",
    button: "",
    action: null,
  });

  const handleCloseConfirm = () => {
    setOpenConfirm({
      open: false,
      title: "",
      data: null,
      message: "",
    });
  };
  // Tabs
  const [tab, setTab] = useState(0);
  const fetchFaculties = useCallback(async () => {
    try {
      const res = await getFaculties();
      setFaculties(res.data.faculties);
      showSnackbar("Faculties Fetched!");
    } catch (error) {
      showSnackbar(
        `${error.response?.data?.message || "Failed to fetch faculties"}`,
        "error",
      );
      console.log(error);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await getCourses();
      setCourses(res.data.courses);
      showSnackbar("Courses Fetched!");
    } catch (error) {
      showSnackbar(
        `${error.response?.data?.message || "Failed to fetch courses"}`,
        "error",
      );
      console.error(error);
    }
  }, []);

  const fetchLevels = async () => {
    try {
      const levelRes = await getLevels();
      setLevels(levelRes.data.levels);
    } catch (error) {
      console.log(error);
    }
  };

  // Department  Section
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const onDeptSubmit = async (data) => {
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, data);
        reset();
        showSnackbar("Department updated successfully!", "success");
        setEditingDept(null);
        setOpenDeptDialog(false);
        const res = await getDepartments();
        setDepartments(res.data.departments);
      } else {
        await addDepartment(data);
        reset();
        showSnackbar("Department added successfully!");
        setOpenDeptDialog(false);
        const res = await getDepartments();
        setDepartments(res.data.departments);
      }
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
  };

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.departments);
      showSnackbar("Departments Fetched!");
    } catch (error) {
      showSnackbar(
        `${error.response?.data?.message || "Failed to fetch departments"}`,
        "error",
      );
      console.log(error);
    }
  }, []);

  const handleDeleteDepartment = async (id) => {
    try {
      await deleteDepartment(id);
      showSnackbar("Department deleted successfully!", "success");
      const res = await getDepartments();
      setDepartments(res.data.departments);
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
      console.log(error);
    }
    return;
  };

  const handleEditDepartment = (department) => {
    setEditingDept(department);
    setValue("name", department.name);
    setValue("school", department.faculty_id);
    setOpenDeptDialog(true);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  // Course Section
  const onCourseSubmit = async (data) => {
    try {
      if (editingCourse) {
        await updateCourse({ ...data, id: editingCourse.id });
        reset();
        showSnackbar("Course updated successfully!", "success");
        setEditingCourse(null);
        setOpenCourseDialog(false);
        const res = await getCourses();
        setCourses(res.data.courses);
      } else {
        console.log(data);
        await createCourse(data);
        reset();
        showSnackbar("Course added successfully!");
        setOpenCourseDialog(false);
        const res = await getCourses();
        setCourses(res.data.courses);
      }
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
  };
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setValue("name", course.name);
    setValue("credit", course.credit_load);
    setValue("code", course.code);
    setValue("semester", course.semester_id);
    setValue("level", course.level_id);
    setValue("department", course.department_name);
    setOpenCourseDialog(true);
  };

  const handleDeleteCourse = async (id) => {
    try {
      await deleteCourse(id);
      await fetchCourses();
    } catch (error) {
      showSnackbar("Failed to delete course", "error");
      console.log(error);
    }
    return;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // session Section
  const onSessionSubmit = async (data) => {
    try {
      if (editingSession) {
        await updateSession({ ...data, id: editingSession.id });
        reset();
        showSnackbar("Session updated successfully!", "success");
        setEditingSession(null);
        setOpenSessionDialog(false);
        const res = await getSessions();
        setSessions(res.data.sessions);
      } else {
        await createSession(data);
        reset();
        showSnackbar("Session added successfully!");
        setOpenSessionDialog(false);
        const res = await getSessions();
        setSessions(res.data.sessions);
      }
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
  };
  const handleEditSession = (session) => {
    setEditingSession(session);
    setValue("name", session.name);
    setValue(
      "start_date",
      moment(session.start_date).utc().format("YYYY-MM-DD"),
    );
    setValue("end_date", moment(session.end_date).utc().format("YYYY-MM-DD"));
    setOpenSessionDialog(true);
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      await fetchSessions();
    } catch (error) {
      showSnackbar("Failed to delete session", "error");
      console.log(error);
    }
  };

  const fetchSessions = async () => {
    try {
      const sesRes = await getSessions();
      setSessions(sesRes.data.sessions);
      showSnackbar("Sesssions fetched!", "success");
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Faculty Section
  const handleFacultyEdit = (faculty) => {
    setEditingFaculty(faculty);
    setValue("name", faculty.name);
    setOpenFacultyDialog(true);
  };

  const handleFacultyDelete = async (id) => {
    try {
      await deleteFaculty(id);
      showSnackbar("Faculty deleted successfully!", "success");
      const res = await getFaculties();
      setFaculties(res.data.faculties);
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
      console.log(error);
    }
    return;
  };
  const onFacultySubmit = async (data) => {
    try {
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, data);
        reset();
        showSnackbar("Faculty updated successfully!", "success");
        setEditingFaculty(null);
        setOpenFacultyDialog(false);
        const res = await getFaculties();
        setFaculties(res.data.faculties);
      } else {
        await addFaculty(data);
        reset();
        showSnackbar("Faculty added successfully!");
        setOpenFacultyDialog(false);
        const res = await getFaculties();
        setFaculties(res.data.faculties);
      }
    } catch (error) {
      showSnackbar(
        error.response.data.message || "There was an error",
        "error",
      );
    }
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

  useEffect(() => {
    if (tab === 0) fetchFaculties();
    else if (tab === 1) fetchDepartments();
    else if (tab === 2) {
      fetchCourses();
      fetchDepartments();
      fetchLevels();
    } else if (tab === 3) fetchSessions();
  }, [tab, fetchFaculties, fetchDepartments, fetchCourses]);

  // Filtered & paginated faculties
  const filtered = faculties.filter((faculty) =>
    faculty.name.toLowerCase().includes(search.toLowerCase()),
  );
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );
  const pageCount = Math.ceil(filtered.length / rowsPerPage);

  // Filtered & paginated sessions
  const sessFiltered = sessions.filter((ses) =>
    ses.name.toLowerCase().includes(search.toLowerCase()),
  );
  const sesPaginated = sessFiltered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );
  const sesCount = Math.ceil(sessFiltered.length / rowsPerPage);

  // Filtered & paginated departments
  const deptFiltered = departments.filter((dept) =>
    dept.name.toLowerCase().includes(deptSearch.toLowerCase()),
  );
  const deptPaginated = deptFiltered.slice(
    (deptPage - 1) * deptRowsPerPage,
    deptPage * deptRowsPerPage,
  );
  const coursePaginated = courses
    .filter((course) =>
      course.name.toLowerCase().includes(courseSearch.toLowerCase()),
    )
    .slice(
      (coursePage - 1) * courseRowsPerPage,
      coursePage * courseRowsPerPage,
    );
  const coursePageCount = Math.ceil(
    courses.filter((course) =>
      course.name.toLowerCase().includes(courseSearch.toLowerCase()),
    ).length / courseRowsPerPage,
  );

  const deptPageCount = Math.ceil(deptFiltered.length / deptRowsPerPage);

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
          Manage Faculties, Departments, Courses and Sessions
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            aria-label="faculties-departments-tabs"
            variant="fullWidth"
          >
            <Tab label="Faculties" />
            <Tab label="Departments" />
            <Tab label="Courses" />
            <Tab label="Sessions" />
          </Tabs>
        </Box>

        {/* Faculties Tab */}
        {tab === 0 && (
          <>
            {/* Search + Add Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                placeholder="Search Faculty"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => setOpenFacultyDialog(true)}
              >
                Add Faculty
              </Button>
            </Box>

            {/* Faculties Table */}
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 90,
                          maxWidth: 120,
                          p: { xs: 0.5, sm: 1 },
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#e3e3fa",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#d1d1f7" },
                            }}
                            onClick={() => handleFacultyEdit(faculty)}
                            aria-label="Edit Faculty"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            onClick={() =>
                              setOpenConfirm({
                                open: true,
                                data: faculty,
                                title: "Delete Faculty",
                                message:
                                  "Are you sure you want to delete this Faculty?",
                                button: "Delete Faculty",
                                action: () => {
                                  handleFacultyDelete(faculty.id);
                                },
                              })
                            }
                            aria-label="Delete Faculty"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No faculties found
                      </TableCell>
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

            {/* Faculty Form Dialog */}
            <Dialog
              open={openFacultyDialog}
              onClose={() => {
                setOpenFacultyDialog(false);
                setEditingFaculty(null);
              }}
            >
              <DialogTitle>
                {editingFaculty ? "Edit Faculty" : "Add Faculty"}
              </DialogTitle>
              <DialogContent>
                <form
                  id="faculty-form"
                  onSubmit={handleSubmit(onFacultySubmit)}
                >
                  <TextField
                    fullWidth
                    label="Faculty Name"
                    {...register("name", { required: true })}
                    sx={{ mt: 2 }}
                  />
                </form>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenFacultyDialog(false);
                    setEditingFaculty(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="faculty-form"
                  variant="contained"
                  color="primary"
                >
                  {editingFaculty ? "Update Faculty" : "Add Faculty"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Departments Tab */}
        {tab === 1 && (
          <>
            {/* Search + Add Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
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
                  {deptPaginated.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>{dept.faculty_name}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 90,
                          maxWidth: 120,
                          p: { xs: 0.5, sm: 1 },
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#e3e3fa",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#d1d1f7" },
                            }}
                            onClick={() => handleEditDepartment(dept)}
                            aria-label="Edit Department"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            onClick={() =>
                              setOpenConfirm({
                                open: true,
                                data: dept,
                                title: "Delete Department",
                                message:
                                  "Are you sure you want to delete this department?",
                                button: "Delete Department",
                                action: () => {
                                  handleDeleteDepartment(dept.id);
                                },
                              })
                            }
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
                      <TableCell colSpan={2} align="center">
                        No departments found
                      </TableCell>
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
            <Dialog
              open={openDeptDialog}
              onClose={() => {
                setOpenDeptDialog(false);
                setEditingDept(false);
              }}
            >
              <DialogTitle>
                {editingDept ? "Edit Department" : "Add Department"}
              </DialogTitle>
              <DialogContent>
                <form
                  id="department-form"
                  onSubmit={handleSubmit(onDeptSubmit)}
                >
                  <TextField
                    fullWidth
                    label="Department Name"
                    {...register("name", { required: true })}
                    sx={{ mt: 2 }}
                  />
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Faculty</InputLabel>
                    <Select
                      {...register("faculty_id", { required: true })}
                      defaultValue={editingDept?.faculty_id || ""}
                    >
                      {faculties.map((faculty) => (
                        <MenuItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </form>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenDeptDialog(false);
                    setEditingDept(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="department-form"
                  variant="contained"
                  color="primary"
                >
                  {editingDept ? "Update" : "Add"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {/* Courses Tab */}
        {tab === 2 && (
          <>
            {/* Search + Add Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                placeholder="Search Courses"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => setOpenCourseDialog(true)}
              >
                Add Course
              </Button>
            </Box>

            {/* Courses Table */}
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coursePaginated.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.department_name}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 90,
                          maxWidth: 120,
                          p: { xs: 0.5, sm: 1 },
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#e3e3fa",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#d1d1f7" },
                            }}
                            onClick={() => handleEditCourse(course)}
                            aria-label="Edit Department"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            onClick={() =>
                              setOpenConfirm({
                                open: true,
                                data: course,
                                title: "Delete Course",
                                message:
                                  "Are you sure you want to delete this course?",
                                button: "Delete Course",
                                action: () => {
                                  handleDeleteCourse(course.id);
                                },
                              })
                            }
                            aria-label="Delete Department"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {coursePaginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            {/* Pagination */}
            {coursePageCount > 1 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={coursePageCount}
                  page={coursePage}
                  onChange={(e, value) => setCoursePage(value)}
                  color="primary"
                />
              </Box>
            )}

            {/* Course Form Dialog */}
            <Dialog
              open={openCourseDialog}
              onClose={() => {
                setOpenCourseDialog(false);
                setEditingCourse(null);
              }}
            >
              <DialogTitle>
                {editingCourse ? "Edit Course" : "Add Course"}
              </DialogTitle>
              <DialogContent>
                <form id="course-form" onSubmit={handleSubmit(onCourseSubmit)}>
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    label="Course Code"
                    {...register("code", { required: true })}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    label="Course Name"
                    {...register("name", { required: true })}
                    sx={{ mt: 2 }}
                  />
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      {...register("department", { required: true })}
                      defaultValue={editingCourse?.department || ""}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Level</InputLabel>
                    <Select
                      {...register("level", { required: true })}
                      defaultValue={editingCourse?.level || ""}
                    >
                      {levels.map((lvl) => (
                        <MenuItem key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel
                      InputLabelProps={{
                        shrink: true,
                      }}
                    >
                      Semester
                    </InputLabel>
                    <Select
                      {...register("semester", { required: true })}
                      defaultValue={editingCourse?.semester || ""}
                    >
                      <MenuItem value={1}> First Semester</MenuItem>
                      <MenuItem value={2}> Second Semester</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="number"
                    fullWidth
                    label="Credit Load"
                    {...register("credit", { required: true })}
                    sx={{ mt: 2 }}
                  />
                </form>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenCourseDialog(false);
                    setEditingCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="course-form"
                  variant="contained"
                  color="primary"
                >
                  {editingCourse ? "Update Course" : "Add Course"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {/* Sessions Tab */}
        {tab === 3 && (
          <>
            {/* Search + Add Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TextField
                placeholder="Search Session"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "50%" }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
                startIcon={<Add />}
                onClick={() => setOpenSessionDialog(true)}
              >
                Add Session
              </Button>
            </Box>

            {/* Sessions Table */}
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sesPaginated.map((ses) => (
                    <TableRow key={ses.id}>
                      <TableCell>{ses.name}</TableCell>
                      <TableCell>
                        {moment(ses.start_date).utc().format("MMMM Do YYYY")}
                      </TableCell>
                      <TableCell>
                        {moment(ses.end_date).utc().format("MMMM Do YYYY")}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          minWidth: 90,
                          maxWidth: 120,
                          p: { xs: 0.5, sm: 1 },
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "flex-end",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: "#e3e3fa",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#d1d1f7" },
                            }}
                            onClick={() => handleEditSession(ses)}
                            aria-label="Edit Session"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: "#fdecea",
                              borderRadius: 2,
                              p: 1,
                              boxShadow: 1,
                              ":hover": { bgcolor: "#f9d6d5" },
                            }}
                            onClick={() =>
                              setOpenConfirm({
                                open: true,
                                data: ses,
                                title: "Delete Session",
                                message:
                                  "Are you sure you want to delete this session?",
                                button: "Delete Session",
                                action: () => {
                                  handleDeleteSession(ses.id);
                                },
                              })
                            }
                            aria-label="Delete Session"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sesPaginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No Sessions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            {/* Pagination */}
            {sesCount > 1 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={sesCount}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}

            {/* Faculty Form Dialog */}
            <Dialog
              open={openSessionDialog}
              onClose={() => {
                setOpenSessionDialog(false);
                setEditingSession(null);
              }}
            >
              <DialogTitle>
                {editingSession ? "Edit Session" : "Add Session"}
              </DialogTitle>
              <DialogContent>
                <form
                  id="session-form"
                  onSubmit={handleSubmit(onSessionSubmit)}
                >
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    label="Session Name"
                    {...register("name", { required: true })}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="date"
                    fullWidth
                    label="Start Date"
                    {...register("start_date", { required: true })}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="date"
                    fullWidth
                    label="End Date"
                    {...register("end_date", { required: true })}
                    sx={{ mt: 2 }}
                  />
                </form>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenSessionDialog(false);
                    setEditingSession(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="session-form"
                  variant="contained"
                  color="primary"
                >
                  {editingSession ? "Update" : "Add"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        <Dialog
          open={openConfirm.open}
          onClose={() => {
            handleCloseConfirm();
          }}
        >
          <DialogTitle>
            <Typography>{openConfirm.title}</Typography>
            <DialogContent>
              <Typography>{openConfirm.message}</Typography>
              <DialogActions>
                <Button onClick={() => handleCloseConfirm()}>Cancel</Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    openConfirm.action(openConfirm.data.id);
                    handleCloseConfirm();
                  }}
                >
                  {openConfirm.button}
                </Button>
              </DialogActions>
            </DialogContent>
          </DialogTitle>
        </Dialog>
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
