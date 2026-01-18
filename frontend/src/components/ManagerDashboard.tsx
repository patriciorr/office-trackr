import React, { useContext, useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AuthContext } from "../context/AuthContext";
import {
  Autocomplete,
  Button,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es, enUS } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

interface ManagerDashboardProps {
  isDarkMode?: boolean;
}

const colorMap: Record<string, string> = {
  office: "#e53935",
  vacation: "#43a047",
  telework: "#1976d2",
};

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  isDarkMode = false,
}) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [coworkers, setCoworkers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoworkers, setSelectedCoworkers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCoworkers, setAvailableCoworkers] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (user!.role === "manager" && user?.team && user.team.length > 0) {
      fetch(`http://localhost:5000/api/users?ids=${user.team.join(",")}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setCoworkers(data))
        .catch(() => setCoworkers([]));
    } else {
      setCoworkers([]);
      setEvents([]);
    }
  }, [user]);

  useEffect(() => {
    if (coworkers.length > 0 && selectedDate) {
      setEvents([]); // Clean previous events
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // JS: 0-indexed, API: 1-indexed
      coworkers.forEach((coworker) => {
        fetch(
          `http://localhost:5000/api/events?userId=${coworker.id}&year=${year}&month=${month}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
          .then((res) => res.json())
          .then((data) => {
            const officeDays = data.filter(
              (event: any) => event.type === "office",
            ).length;
            const vacationDays = data.filter(
              (event: any) => event.type === "vacation",
            ).length;
            setEvents((prev) => [
              ...prev,
              {
                userId: coworker.id,
                officeDays,
                vacationDays,
              },
            ]);
          })
          .catch(() => {});
      });
    } else {
      setEvents([]);
    }
  }, [coworkers, selectedDate]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/users?roles=coworker`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => data.filter((c: any) => !user?.team?.includes(c.id)))
      .then((filtered) => setAvailableCoworkers(filtered))
      .catch(() => setAvailableCoworkers([]));
  }, [user]);

  const handleRemoveCoworker = async (id: string) => {
    setLoadingId(id);
    try {
      const newTeam = user!.team!.filter((uid) => uid !== id);
      const res = await fetch(`http://localhost:5000/api/users/${user!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ team: newTeam }),
      });
      if (!res.ok) throw new Error("Error actualizando equipo");
      const updated = await res.json();
      setUser(updated);
    } catch (e: any) {
      setError(e.message || "Error desconocido");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        p: 4,
        justifyContent: "center",
        background: isDarkMode ? "#232946" : "#fff",
        color: isDarkMode ? "#eaf0fa" : "#232946",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <LocalizationProvider
          key={i18n.language}
          dateAdapter={AdapterDateFns}
          adapterLocale={i18n.language === "es" ? es : enUS}
        >
          <DatePicker
            views={["month", "year"]}
            label={t("select_month")}
            minDate={new Date(2022, 0, 1)}
            maxDate={new Date(2100, 11, 31)}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
        }}
      >
        {coworkers.map((worker) => (
          <Box
            key={worker.id}
            sx={{ position: "relative", display: "inline-block" }}
          >
            <Paper
              elevation={3}
              sx={{
                background: isDarkMode ? "#232946" : "#fff",
                borderRadius: 3,
                minWidth: 260,
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
                onClick={() => handleRemoveCoworker(worker.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? "#eaf0fa" : "#1b1b1b",
                  mb: 1,
                }}
              >
                {worker.firstName} {worker.lastName}
              </Typography>
              <Box sx={{ width: "100%", mb: 1 }}>
                <Typography
                  sx={{ color: colorMap.office, fontWeight: 600 }}
                  component="span"
                >
                  {t("office_days")}:{" "}
                  {
                    events.find((event) => event.userId === worker.id)
                      ?.officeDays
                  }
                </Typography>
              </Box>
              <Box sx={{ width: "100%", mb: 1 }}>
                <Typography
                  sx={{ color: colorMap.vacation, fontWeight: 600 }}
                  component="span"
                >
                  {t("vacation_days")}:{" "}
                  {
                    events.find((event) => event.userId === worker.id)
                      ?.vacationDays
                  }
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
        {availableCoworkers.length > 0 && (
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            {t("add_coworker")}
          </Button>
        )}
      </Box>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            {t("add_coworker_title")}
          </Typography>
          <Autocomplete
            multiple
            options={availableCoworkers}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`
            }
            onChange={(_, value) =>
              setSelectedCoworkers(value.map((c) => c.id))
            }
            renderInput={(params) => (
              <TextField {...params} label={t("coworkers")} />
            )}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const newTeam = [...user?.team!, ...selectedCoworkers];
                  const res = await fetch(
                    `http://localhost:5000/api/users/${user!.id}`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                          "token",
                        )}`,
                      },
                      body: JSON.stringify({ team: newTeam }),
                    },
                  );
                  if (!res.ok) throw new Error("Error actualizando equipo");
                  const updated = await res.json();
                  setUser(updated);
                  setModalOpen(false);
                  setSelectedCoworkers([]);
                } catch (e: any) {
                  setError(e.message || "Error desconocido");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || selectedCoworkers.length === 0}
            >
              {t("confirm")}
            </Button>
            <Button onClick={() => setModalOpen(false)}>{t("cancel")}</Button>
          </Box>
          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ManagerDashboard;
