import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { CalendarEvent, CalendarEventType } from "./Calendar";
import { useTranslation } from "react-i18next";
import { eventColors } from "../themeColors";
import { surfaceColors } from "../themeColors";

interface DayEventPanelProps {
  date: string;
  event?: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  isDarkMode?: boolean;
}

const DayEventPanel: React.FC<DayEventPanelProps> = ({
  date,
  event,
  onSave,
  onDelete,
  isDarkMode = false,
}) => {
  const { t } = useTranslation();
  const colors = isDarkMode ? { office: eventColors.office.dark, vacation: eventColors.vacation.dark } : { office: eventColors.office.light, vacation: eventColors.vacation.light };
  const [type, setType] = useState<CalendarEventType | null>(
    event?.type || null,
  );

  useEffect(() => {
    setType(event?.type || null);
  }, [event]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: "fit-content",
        background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
        color: isDarkMode ? "#edf7f8" : "#183247",
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        {event ? t("edit_event") : t("add_event")} {t("for_date", { date })}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant={type === "office" ? "contained" : "outlined"}
          onClick={() => {
            setType("office");
            onSave({ ...event, date, type: "office" });
          }}
          sx={{
            color: type === "office"
              ? isDarkMode ? "#142027" : "#fff"
              : colors.office.main,
            borderColor: colors.office.main,
            backgroundColor: type === "office" ? colors.office.main : "transparent",
            "&:hover": { backgroundColor: colors.office.hover, color: "#fff" },
          }}
        >
          {t("office")}
        </Button>
        <Button
          variant={type === "vacation" ? "contained" : "outlined"}
          onClick={() => {
            setType("vacation");
            onSave({ ...event, date, type: "vacation" });
          }}
          sx={{
            color: type === "vacation"
              ? isDarkMode ? "#142027" : "#fff"
              : colors.vacation.main,
            borderColor: colors.vacation.main,
            backgroundColor:
              type === "vacation" ? colors.vacation.main : "transparent",
            "&:hover": { backgroundColor: colors.vacation.hover, color: "#fff" },
          }}
        >
          {t("vacation")}
        </Button>
        {event && onDelete && (
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => onDelete(event)}
          >
            {t("delete")}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DayEventPanel;
