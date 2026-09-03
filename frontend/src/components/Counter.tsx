import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { CalendarEvent } from "./Calendar";
import { eventColors, progressColors } from "../themeColors";
import { surfaceColors } from "../themeColors";

interface CounterProps {
  events: CalendarEvent[];
  year: number;
  month: number; // 0-indexed
  isDarkMode?: boolean;
}

const Counter: React.FC<CounterProps> = ({
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
  const laborDays = getLaborDays(year, month);

  const officeDaysArr = events.filter(
    (e: CalendarEvent) =>
      e.type === "office" && laborDays.includes(e.date.slice(0, 10))
  );
  const vacationDaysArr = events.filter(
    (e: CalendarEvent) =>
      e.type === "vacation" && laborDays.includes(e.date.slice(0, 10))
  );
  const officeDays = officeDaysArr.length;
  const vacationDays = vacationDaysArr.length;

  const vacationDates = vacationDaysArr.map((e) => e.date.slice(0, 10));
  const officeDates = officeDaysArr.map((e) => e.date.slice(0, 10));
  const laborDaysNoVacation = laborDays.filter(
    (d) => !vacationDates.includes(d)
  );

  const teleworkDays = laborDaysNoVacation.filter(
    (d) => !officeDates.includes(d)
  ).length;

  const rawRequired = laborDaysNoVacation.length * 0.4;
  const requiredOfficeDays =
    rawRequired % 1 < 0.5 ? Math.floor(rawRequired) : Math.ceil(rawRequired);

  const percentOfRequired =
    requiredOfficeDays === 0
      ? 0
      : Math.round(Math.min(officeDays / requiredOfficeDays, 1) * 100);

  const percentOfLaborDays =
    laborDaysNoVacation.length === 0
      ? 0
      : Math.round(Math.min(officeDays / laborDaysNoVacation.length, 1) * 100);

  const colors = isDarkMode ? progressColors.dark : progressColors.light;
  let circleColor = colors.low;
  if (percentOfRequired === 100) {
    circleColor = colors.success;
  } else if (percentOfLaborDays >= 40) {
    circleColor = colors.success;
  } else if (percentOfLaborDays >= 30) {
    circleColor = colors.warning;
  } else if (percentOfLaborDays >= 20) {
    circleColor = isDarkMode ? "#e9a86a" : "#c9764b";
  }

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
        color: isDarkMode ? "#edf7f8" : "#183247",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        {t("monthly_summary")}
      </Typography>
      <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
        <CircularProgress variant="determinate" value={100} size={112} thickness={5.5} sx={{ color: colors.track }} />
        <CircularProgress
          variant="determinate"
          value={percentOfRequired}
          size={112}
          thickness={5.5}
          sx={{ color: circleColor, position: "absolute", left: 0 }}
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {percentOfRequired}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
        {t("office_progress", {
          office: officeDays,
          required: requiredOfficeDays,
        })}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: isDarkMode ? eventColors.office.dark.main : eventColors.office.light.main, fontWeight: 700, mb: 1.5 }}
      >
        {t("office_days")}: {officeDays}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: isDarkMode ? eventColors.vacation.dark.main : eventColors.vacation.light.main, fontWeight: 700, mb: 1.5 }}
      >
        {t("vacation_days")}: {vacationDays}
      </Typography>
      <Typography variant="body1" sx={{ color: isDarkMode ? eventColors.telework.dark.main : eventColors.telework.light.main, fontWeight: 700 }}>
        {t("telework_days")}: {teleworkDays}
      </Typography>
    </Box>
  );
};

export default Counter;
