import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { CalendarEventType, CalendarEvent } from "./Calendar";
import { useTranslation } from "react-i18next";

interface DayEventModalProps {
  date: string;
  event?: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete?: () => void;
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
  const [type, setType] = useState<CalendarEventType>(event?.type || "office");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...event, date, type });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          background: isDarkMode ? "#232946" : "#fff",
          color: isDarkMode ? "#eaf0fa" : "#232946",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {event ? t("edit_event") : t("add_event")}{" "}
          {t("for_date", { date: date })}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="type-label">{t("event_type")}</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              label={t("event_type")}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
            >
              <MenuItem value="office">{t("office")}</MenuItem>
              <MenuItem value="vacation">{t("vacation")}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            sx={{ background: "#888", color: "#fff" }}
          >
            {t("save")}
          </Button>
          {onDelete && (
            <Button
              type="button"
              sx={{ background: "#bbb", color: "#222", ml: 2 }}
              onClick={onDelete}
            >
              {t("delete")}
            </Button>
          )}
          <Button type="button" onClick={onClose}>
            {t("cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DayEventModal;
