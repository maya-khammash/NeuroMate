import React, { useEffect, useState } from "react";
import { getAllData, deleteUser, addUser } from "../api/admin";
import Layout from "../components/Layout";

import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Grid,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  LocalHospital as DoctorIcon,
  School as StudentIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const roleConfig = {
  doctor: { icon: <DoctorIcon />, color: "#00d4aa", label: "Doctor" },
  student: { icon: <StudentIcon />, color: "#a855f7", label: "Student" },
  admin: { icon: <AdminIcon />, color: "#f59e0b", label: "Admin" },
};

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [addUserDialog, setAddUserDialog] = useState({ open: false });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'student' });
  const currentUserId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllData();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      await deleteUser(deleteDialog.user.user_id);
      setUsers(users.filter((u) => u.user_id !== deleteDialog.user.user_id));
      setDeleteDialog({ open: false, user: null });
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const handleAddUser = async () => {
    try {
      const result = await addUser(newUser);
      setUsers([...users, result.user]);
      setAddUserDialog({ open: false });
      setNewUser({ username: '', password: '', role: 'student' });
      alert("User added successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to add user");
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: <PeopleIcon />,
      color: "#00d4aa",
      gradient: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
    },
    {
      title: "Doctors",
      value: users.filter(u => u.role === "doctor").length,
      icon: <DoctorIcon />,
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    },
    {
      title: "Students",
      value: users.filter(u => u.role === "student").length,
      icon: <StudentIcon />,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
    },
    {
      title: "Admins",
      value: users.filter(u => u.role === "admin").length,
      icon: <ShieldIcon />,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Admin Panel
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Manage users and system settings
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} sm={3} key={stat.title}>
            <Fade in timeout={400 + index * 150}>
              <Card
                sx={{
                  background: "rgba(17, 24, 39, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    border: `1px solid ${stat.color}40`,
                    boxShadow: `0 15px 30px ${stat.color}20`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {loading ? <Skeleton width={40} /> : stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: stat.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 6px 15px ${stat.color}40`,
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { color: "white", fontSize: 20 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddUserDialog({ open: true })}
              sx={{
                background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #00b894 0%, #0984e3 100%)",
                },
              }}
            >
              Add User
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Patients</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton width={80} /></TableCell>
                      <TableCell><Skeleton width={40} /></TableCell>
                      <TableCell><Skeleton width={60} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  users.map((user, index) => {
                    const role = roleConfig[user.role] || roleConfig.student;
                    return (
                      <Fade in timeout={200 + index * 50} key={user.user_id}>
                        <TableRow
                          sx={{
                            transition: "all 0.2s ease",
                            "&:hover": {
                              background: "rgba(0, 212, 170, 0.05)",
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: `${role.color}30`,
                                  color: role.color,
                                }}
                              >
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {user.username}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  ID: #{user.user_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={role.icon}
                              label={role.label}
                              size="small"
                              sx={{
                                background: `${role.color}20`,
                                color: role.color,
                                border: `1px solid ${role.color}40`,
                                "& .MuiChip-icon": { color: role.color },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.patients?.length || 0}
                              size="small"
                              sx={{
                                background: "rgba(0, 212, 170, 0.15)",
                                color: "#00d4aa",
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {user.user_id !== currentUserId && (
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteDialog({ open: true, user })}
                                  sx={{
                                    color: "#ef4444",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    "&:hover": {
                                      background: "rgba(239, 68, 68, 0.2)",
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        PaperProps={{
          sx: {
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Are you sure you want to delete user{" "}
            <strong style={{ color: "#ef4444" }}>{deleteDialog.user?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, user: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={addUserDialog.open}
        onClose={() => setAddUserDialog({ open: false })}
        PaperProps={{
          sx: {
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          Add New User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#00d4aa" },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#00d4aa" },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                label="Role"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#00d4aa" },
                }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setAddUserDialog({ open: false })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={!newUser.username || !newUser.password}
            sx={{
              background: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #00b894 0%, #0984e3 100%)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
