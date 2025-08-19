import React from "react";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "./Calendar";
import { DateCalendar, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface CalendarWorkdaysProps {
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
  isDarkMode?: boolean;
}

function CustomDay(props: PickersDayProps & { events: CalendarEvent[] }) {
  const { day, events, ...other } = props;
  // Evita desfase por zona horaria: compara solo la parte YYYY-MM-DD
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(
    day.getDate()
  )}`;
  const event = events.find((e: any) => {
    const eventDate =
      typeof e.date === "string"
        ? e.date.slice(0, 10)
        : `${e.date.getFullYear()}-${pad(e.date.getMonth() + 1)}-${pad(
            e.date.getDate()
          )}`;
    return eventDate === dateStr;
  });
  let sx = {};
  if (event?.type === "office") {
    sx = {
      backgroundColor: "#e53935",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#d32f2f",
      },
    };
  } else if (event?.type === "vacation") {
    sx = {
      backgroundColor: "#43a047",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#388e3c",
      },
    };
  }
  return <PickersDay day={day} {...other} sx={sx} />;
}

const CalendarWorkdays: React.FC<CalendarWorkdaysProps> = ({
  events = [],
  onSelectDay,
  onMonthChange,
  isDarkMode = false,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = React.useState<number>(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = React.useState<number>(
    new Date().getFullYear()
  );

  // Detectar cambio de mes/año en el calendario
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
    if (typeof onMonthChange === "function") {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        background: isDarkMode ? "#232946" : "#fff",
        color: isDarkMode ? "#eaf0fa" : "#232946",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {t("calendar")}
      </Typography>
      <DateCalendar
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          if (date) onSelectDay(date as Date);
        }}
        onMonthChange={handleMonthChange}
        slots={{
          day: (props: any) => <CustomDay {...props} events={events} />,
        }}
        sx={{ width: "100%" }}
      />
    </Box>
  );
};

export default CalendarWorkdays;
