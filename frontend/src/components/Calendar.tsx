import React from "react";
import { useTranslation } from "react-i18next";
import { DateCalendar, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { eventColors } from "../themeColors";
import { surfaceColors } from "../themeColors";

export type CalendarEventType = "office" | "vacation";

export interface CalendarEvent {
  id?: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
}

interface CalendarProps {
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
  isDarkMode?: boolean;
}

function CustomDay(
  props: PickersDayProps & { events: CalendarEvent[]; isDarkMode: boolean },
) {
  const { day, events, isDarkMode, ...other } = props;

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
    const color = isDarkMode ? eventColors.office.dark : eventColors.office.light;
    sx = {
      backgroundColor: color.main,
      color: isDarkMode ? "#142027" : "#fff",
      "&:hover": {
        backgroundColor: color.hover,
      },
    };
  } else if (event?.type === "vacation") {
    const color = isDarkMode
      ? eventColors.vacation.dark
      : eventColors.vacation.light;
    sx = {
      backgroundColor: color.main,
      color: isDarkMode ? "#142027" : "#fff",
      "&:hover": {
        backgroundColor: color.hover,
      },
    };
  }
  return <PickersDay day={day} {...other} sx={sx} />;
}

const Calendar: React.FC<CalendarProps> = ({
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
        background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
        color: isDarkMode ? "#edf7f8" : "#183247",
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
        minDate={new Date(currentYear - 2, currentMonth, 1)}
        maxDate={new Date(currentYear + 2, currentMonth, 1)}
        slots={{
          day: (props: any) => (
            <CustomDay {...props} events={events} isDarkMode={isDarkMode} />
          ),
        }}
        sx={{ width: "100%" }}
      />
    </Box>
  );
};

export default Calendar;
