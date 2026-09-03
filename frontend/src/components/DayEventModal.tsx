import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { CalendarEventType, CalendarEvent } from "./Calendar";
import { useTranslation } from "react-i18next";
import { eventColors } from "../themeColors";
import { surfaceColors } from "../themeColors";

interface DayEventModalProps {
  date: string;
  event?: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const DayEventModal: React.FC<DayEventModalProps> = ({
  date,
  event,
  onSave,
  onDelete,
  onClose,
  isDarkMode = false,
}) => {
  const { t } = useTranslation();
  const colors = isDarkMode ? { office: eventColors.office.dark, vacation: eventColors.vacation.dark } : { office: eventColors.office.light, vacation: eventColors.vacation.light };
  const [type, setType] = useState<CalendarEventType | null>(
    event?.type || null,
  );

  const handleTypeSelect = (selectedType: CalendarEventType) => {
    setType(selectedType);
    onSave({ ...event, date, type: selectedType });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
          color: isDarkMode ? "#edf7f8" : "#183247",
        },
      }}
    >
      <Box>
        <DialogTitle>
          {event ? t("edit_event") : t("add_event")}{" "}
          {t("for_date", { date: date })}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              variant={type === "office" ? "contained" : "outlined"}
              onClick={() => handleTypeSelect("office")}
              sx={{
                color: type === "office"
                  ? isDarkMode ? "#142027" : "#fff"
                  : colors.office.main,
                borderColor: colors.office.main,
                backgroundColor:
                  type === "office" ? colors.office.main : "transparent",
                "&:hover": { backgroundColor: colors.office.hover, color: "#fff" },
              }}
            >
              {t("office")}
            </Button>
            <Button
              variant={type === "vacation" ? "contained" : "outlined"}
              onClick={() => handleTypeSelect("vacation")}
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
          </Box>
        </DialogContent>
        <DialogActions>
          {event && onDelete && (
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => onDelete(event)}
            >
              {t("delete")}
            </Button>
          )}
          <Button onClick={onClose}>
            {t("cancel")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DayEventModal;
