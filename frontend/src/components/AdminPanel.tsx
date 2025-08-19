import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface AdminPanelProps {
  onAddHoliday: (date: string) => void;
  onAddConcentration: (date: string, note?: string) => void;
  isDarkMode?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onAddHoliday,
  onAddConcentration,
  isDarkMode = false,
}) => {
  const [holidayDate, setHolidayDate] = React.useState("");
  const [concentrationDate, setConcentrationDate] = React.useState("");
  const [concentrationNote, setConcentrationNote] = React.useState("");

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Agregar festivo nacional
        </Typography>
        <TextField
          type="date"
          value={holidayDate}
          onChange={(e) => setHolidayDate(e.target.value)}
          sx={{ mr: 2 }}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAddHoliday(holidayDate)}
          disabled={!holidayDate}
        >
          Agregar
        </Button>
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Agregar día de concentración en oficina
        </Typography>
        <TextField
          type="date"
          value={concentrationDate}
          onChange={(e) => setConcentrationDate(e.target.value)}
          sx={{ mr: 2 }}
          size="small"
        />
        <TextField
          type="text"
          placeholder="Nota (opcional)"
          value={concentrationNote}
          onChange={(e) => setConcentrationNote(e.target.value)}
          sx={{ mr: 2 }}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            onAddConcentration(concentrationDate, concentrationNote)
          }
          disabled={!concentrationDate}
        >
          Agregar
        </Button>
      </Box>
    </Paper>
  );
};

export default AdminPanel;
