import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface AdminPanelProps {
  isDarkMode?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isDarkMode = false }) => {
  return (
    <Paper
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 4,
        p: 3,
        borderRadius: 3,
        boxShadow: 3,
        background: isDarkMode ? "#232946" : "#fff",
        color: isDarkMode ? "#eaf0fa" : "#232946",
      }}
    >
      <Typography
        variant="h5"
        sx={{ color: "#1976d2", mb: 3, fontWeight: 700 }}
      >
        Panel de administración
      </Typography>
    </Paper>
  );
};

export default AdminPanel;
