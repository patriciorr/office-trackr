import React from "react";
import { useTranslation } from "react-i18next";
import type { CalendarEvent } from "./Calendar";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface MonthEventCounterProps {
  events: CalendarEvent[];
  year: number;
  month: number; // 0-indexed
  isDarkMode?: boolean;
}

const MonthEventCounter: React.FC<MonthEventCounterProps> = ({
  events,
  year,
  month,
  isDarkMode = false,
}) => {
  const { t } = useTranslation();
  function getLaborDays(year: number, month: number) {
    const days: string[] = [];
    const pad = (n: number) => n.toString().padStart(2, "0");
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(
          `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
            date.getDate()
          )}`
        );
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  // Los eventos ya están filtrados por mes, solo filtra por tipo
  const officeDaysArr = events.filter(
    (e: CalendarEvent) => e.type === "office"
  );
  const vacationDaysArr = events.filter(
    (e: CalendarEvent) => e.type === "vacation"
  );
  const officeDays = officeDaysArr.length;
  const vacationDays = vacationDaysArr.length;

  // Laborables del mes (lunes a viernes)
  const laborDays = getLaborDays(year, month);
  // Laborables sin vacaciones (solo lunes a viernes)
  const vacationDates = vacationDaysArr.map((e) => e.date.slice(0, 10));
  const officeDates = officeDaysArr.map((e) => e.date.slice(0, 10));
  const laborDaysNoVacation = laborDays.filter(
    (d) => !vacationDates.includes(d)
  );
  // Días de teletrabajo = laborables sin oficina ni vacaciones
  const teleworkDays = laborDaysNoVacation.filter(
    (d) => !officeDates.includes(d)
  ).length;
  // Progreso: 40% de laborDaysNoVacation
  const rawRequired = laborDaysNoVacation.length * 0.4;
  const requiredOfficeDays =
    rawRequired % 1 < 0.5 ? Math.floor(rawRequired) : Math.ceil(rawRequired);
  // Porcentaje de cumplimiento sobre el objetivo obligatorio (máx 100%)
  const percentOfRequired =
    requiredOfficeDays === 0
      ? 0
      : Math.round(Math.min(officeDays / requiredOfficeDays, 1) * 100);
  // Porcentaje de días de oficina sobre el total de laborables sin vacaciones (máx 100%)
  const percentOfLaborDays =
    laborDaysNoVacation.length === 0
      ? 0
      : Math.round(Math.min(officeDays / laborDaysNoVacation.length, 1) * 100);

  // Color del círculo según porcentaje de días de oficina sobre laborables sin vacaciones
  let circleColor = "#e53935"; // rojo
  if (percentOfRequired === 100) {
    circleColor = "#43a047"; // verde
  } else if (percentOfLaborDays >= 40) {
    circleColor = "#43a047"; // verde
  } else if (percentOfLaborDays >= 30) {
    circleColor = "#ffd600"; // amarillo
  } else if (percentOfLaborDays >= 20) {
    circleColor = "#ffa726"; // naranja amarillento
  } else if (percentOfLaborDays >= 10) {
    circleColor = "#ff7043"; // naranja rojizo
  }

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        background: isDarkMode ? "#232946" : "#fff",
        color: isDarkMode ? "#eaf0fa" : "#232946",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {t("monthly_summary")}
      </Typography>
      <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={percentOfRequired}
          size={90}
          thickness={5}
          sx={{ color: circleColor }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {percentOfRequired}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
        {t("office_progress", {
          office: officeDays,
          required: requiredOfficeDays,
        })}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "#e53935", fontWeight: 600, mb: 1 }}
      >
        {t("office_days")}: {officeDays}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "#43a047", fontWeight: 600, mb: 1 }}
      >
        {t("vacation_days")}: {vacationDays}
      </Typography>
      <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600 }}>
        {t("telework_days")}: {teleworkDays}
      </Typography>
    </Box>
  );
};

export default MonthEventCounter;
