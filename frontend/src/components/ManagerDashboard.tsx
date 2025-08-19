import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface WorkerSummary {
  userId: string;
  name: string;
  officeDays: number;
  vacationDays: number;
  wfaDays: number;
}

interface ManagerDashboardProps {
  summaries: WorkerSummary[];
  isDarkMode?: boolean;
}

const colorMap: Record<string, string> = {
  office: "#1976d2",
  vacation: "#90caf9",
  wfa: "#6a89cc",
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  summaries,
  isDarkMode = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        p: 4,
        justifyContent: "center",
        background: isDarkMode ? "#232946" : "#fff",
        color: isDarkMode ? "#eaf0fa" : "#232946",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      {summaries.map((worker) => (
        <Paper
          key={worker.userId}
          elevation={3}
          sx={{
            background: "#fff",
            borderRadius: 3,
            minWidth: 260,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}
          >
            {worker.name}
          </Typography>
          <Box sx={{ width: "100%", mb: 1 }}>
            <Typography
              sx={{ color: colorMap.office, fontWeight: 600 }}
              component="span"
            >
              Oficina:
            </Typography>
            <Typography component="span"> {worker.officeDays}</Typography>
          </Box>
          <Box sx={{ width: "100%", mb: 1 }}>
            <Typography
              sx={{ color: colorMap.vacation, fontWeight: 600 }}
              component="span"
            >
              Vacaciones:
            </Typography>
            <Typography component="span"> {worker.vacationDays}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default ManagerDashboard;
