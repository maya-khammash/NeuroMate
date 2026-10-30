import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Avatar,
    Divider,
    Tooltip,
    Fade,
    Chip,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    PersonAdd as PersonAddIcon,
    Logout as LogoutIcon,
    AdminPanelSettings as AdminIcon,
    MenuBook as CasesIcon,
    LocalHospital as HospitalIcon,
    Menu as MenuIcon,
    Psychology as BrainIcon,
} from "@mui/icons-material";
import MedicalBackground from "./MedicalBackground";

const drawerWidth = 280;

const roleConfig = {
    doctor: {
        title: "Doctor Portal",
        color: "#00d4aa",
        gradient: "linear-gradient(135deg, #00d4aa 0%, #0ea5e9 100%)",
        icon: <HospitalIcon />,
        menuItems: [
            { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
            { text: "Add Patient", icon: <PersonAddIcon />, path: "/add-patient" },
        ],
    },
    student: {
        title: "Student Portal",
        color: "#a855f7",
        gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
        icon: <CasesIcon />,
        menuItems: [
            { text: "Cases", icon: <CasesIcon />, path: "/cases" },
        ],
    },
    admin: {
        title: "Admin Portal",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        icon: <AdminIcon />,
        menuItems: [
            { text: "Admin Panel", icon: <AdminIcon />, path: "/admin" },
        ],
    },
};

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = localStorage.getItem("role") || "doctor";
    const config = roleConfig[role] || roleConfig.doctor;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const drawer = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 26, 0.98) 100%)",
                backdropFilter: "blur(20px)",
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "14px",
                        background: config.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 8px 32px ${config.color}40`,
                        animation: "pulse 2s ease-in-out infinite",
                        "@keyframes pulse": {
                            "0%, 100%": { transform: "scale(1)" },
                            "50%": { transform: "scale(1.05)" },
                        },
                    }}
                >
                    <BrainIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        NeuroMate
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                        Clinical Digital Twin
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

            {/* Role Badge */}
            <Box sx={{ px: 3, py: 2 }}>
                <Chip
                    icon={config.icon}
                    label={config.title}
                    sx={{
                        background: `${config.color}20`,
                        color: config.color,
                        border: `1px solid ${config.color}40`,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: config.color },
                    }}
                />
            </Box>

            {/* Navigation */}
            <List sx={{ px: 2, flex: 1 }}>
                {config.menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Fade in timeout={300 + index * 100} key={item.text}>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: "12px",
                                        py: 1.5,
                                        background: isActive
                                            ? `${config.color}15`
                                            : "transparent",
                                        border: isActive
                                            ? `1px solid ${config.color}30`
                                            : "1px solid transparent",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: `${config.color}10`,
                                            transform: "translateX(4px)",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: isActive ? config.color : "text.secondary",
                                            minWidth: 40,
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? config.color : "text.primary",
                                        }}
                                    />
                                    {isActive && (
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                background: config.color,
                                                boxShadow: `0 0 10px ${config.color}`,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        </Fade>
                    );
                })}
            </List>

            {/* Logout Section */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: "12px",
                        py: 1.5,
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            background: "rgba(239, 68, 68, 0.2)",
                            transform: "translateX(4px)",
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: "#ef4444", minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{ color: "#ef4444", fontWeight: 500 }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <MedicalBackground />

            {/* App Bar for Mobile */}
            <AppBar
                position="fixed"
                sx={{
                    display: { md: "none" },
                    background: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                        NeuroMate
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            border: "none",
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            border: "none",
                            background: "transparent",
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    pt: { xs: 10, md: 4 },
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: "100vh",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Fade in timeout={500}>
                    <Box
                        sx={{
                            animation: "slideUp 0.5s ease-out",
                            "@keyframes slideUp": {
                                from: { opacity: 0, transform: "translateY(20px)" },
                                to: { opacity: 1, transform: "translateY(0)" },
                            },
                        }}
                    >
                        {children}
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
}
