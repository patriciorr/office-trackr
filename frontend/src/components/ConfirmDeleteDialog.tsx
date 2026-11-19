import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { errorMessageKey, fetchWithNetworkError } from "../locales/errorMessage";

interface ConfirmDeleteDialogProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  onClose: () => void;
  onDeleted?: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  user,
  onClose,
  onDeleted,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithNetworkError(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok && res.status !== 204)
        throw new Error();
      if (onDeleted) onDeleted();
      onClose();
    } catch (e: unknown) {
      setError(errorMessageKey(e, "delete_user_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{t("delete_user")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("delete_confirmation", {
            name: `${user.firstName} ${user.lastName}`,
          })}
        </Typography>
        {error && (
          <Typography color="error" mt={2}>
            {t(error)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : t("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
