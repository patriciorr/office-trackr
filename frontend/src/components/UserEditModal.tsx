import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface UserEditModalProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  onClose: () => void;
  onSaved?: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: any = { firstName, lastName };
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(t("name_update_failed"));
      if (onSaved) onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || t("unknown_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{t("edit_user")}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label={t("first_name")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("last_name")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
          {error && <Box color="error.main">{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button onClick={handleSave} disabled={loading} variant="contained">
          {loading ? <CircularProgress size={20} /> : t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditModal;
