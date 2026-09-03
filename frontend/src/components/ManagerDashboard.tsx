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
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PickersCalendarHeaderProps } from "@mui/x-date-pickers/PickersCalendarHeader";
import { addMonths, addYears, isAfter, isBefore } from "date-fns";
import { es, enUS } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { eventColors } from "../themeColors";
import { surfaceColors } from "../themeColors";

interface ManagerDashboardProps {
  isDarkMode?: boolean;
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "calc(100% - 32px)", sm: 400 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const minPickerDate = new Date(2022, 0, 1);
const maxPickerDate = new Date(2100, 11, 31);

const CalendarHeader: React.FC<PickersCalendarHeaderProps> = ({
  currentMonth,
  onMonthChange,
}) => {
  const previousYear = addYears(currentMonth, -1);
  const previousMonth = addMonths(currentMonth, -1);
  const nextMonth = addMonths(currentMonth, 1);
  const nextYear = addYears(currentMonth, 1);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
        py: 0.5,
      }}
    >
      <Box sx={{ display: "flex" }}>
        <IconButton
          size="small"
          title="Previous year"
          aria-label="Previous year"
          onClick={() => onMonthChange(previousYear)}
          disabled={isBefore(previousYear, minPickerDate)}
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          title="Previous month"
          aria-label="Previous month"
          onClick={() => onMonthChange(previousMonth)}
          disabled={isBefore(previousMonth, minPickerDate)}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
        {`${currentMonth.toLocaleDateString(i18n.language, {
          month: "long",
        })} ${currentMonth.getFullYear()}`}
      </Typography>
      <Box sx={{ display: "flex" }}>
        <IconButton
          size="small"
          title="Next month"
          aria-label="Next month"
          onClick={() => onMonthChange(nextMonth)}
          disabled={isAfter(nextMonth, maxPickerDate)}
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          size="small"
          title="Next year"
          aria-label="Next year"
          onClick={() => onMonthChange(nextYear)}
          disabled={isAfter(nextYear, maxPickerDate)}
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  isDarkMode = false,
}) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const colorMap = isDarkMode
    ? {
        office: eventColors.office.dark.main,
        vacation: eventColors.vacation.dark.main,
      }
    : {
        office: eventColors.office.light.main,
        vacation: eventColors.vacation.light.main,
      };
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
        gap: { xs: 3, md: 5 },
        p: { xs: 2, sm: 3, md: 4 },
        justifyContent: "center",
        background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
        color: isDarkMode ? "#edf7f8" : "#183247",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      {(coworkers.length === 0 || availableCoworkers.length > 0) && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 0, md: 1 } }}>
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={() => setModalOpen(true)}
            sx={{
              minHeight: 44,
              px: { xs: 2, sm: 3 },
              fontWeight: 700,
            }}
          >
            {t("add_coworker")}
          </Button>
        </Box>
      )}
      {coworkers.length > 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", px: { xs: 1, sm: 0 } }}>
            <LocalizationProvider
              key={i18n.language}
              dateAdapter={AdapterDateFns}
              adapterLocale={i18n.language === "es" ? es : enUS}
            >
              <DateCalendar
                minDate={minPickerDate}
                maxDate={maxPickerDate}
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                onMonthChange={(newMonth) => setSelectedDate(newMonth)}
                slots={{ calendarHeader: CalendarHeader }}
                sx={{
                  "& .MuiDayCalendar-root, & .MuiPickersFadeTransitionGroup-root": {
                    display: "none",
                  },
                  height: "auto",
                  minHeight: "auto",
                  overflow: "hidden",
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 3, md: 4 },
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
                background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
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
                  color: isDarkMode ? "#edf7f8" : "#183247",
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
          </Box>
        </>
      )}
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
