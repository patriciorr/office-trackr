import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  team?: string[];
}

interface Coworker {
  id: string;
  firstName: string;
  lastName: string;
}

interface TeamEditModalProps {
  user: User;
  onClose: () => void;
  onSaved?: () => void;
}

const TeamEditModal: React.FC<TeamEditModalProps> = ({
  user,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [selected, setSelected] = useState<Coworker[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFetching(true);
    fetch("http://localhost:5000/api/users?roles=coworker", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCoworkers(data);
        setSelected(data.filter((c: Coworker) => user.team?.includes(c.id)));
      })
      .catch(() => setCoworkers([]))
      .finally(() => setFetching(false));
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const newTeam = selected.map((c) => c.id);
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ team: newTeam }),
      });
      if (!res.ok) throw new Error(t("team_update_failed"));
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
      <DialogTitle>
        {t("edit_team_title", { name: `${user.firstName} ${user.lastName}` })}
      </DialogTitle>
      <DialogContent>
        {fetching ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Autocomplete
            multiple
            options={coworkers}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`
            }
            value={selected}
            onChange={(_, value) => setSelected(value)}
            renderInput={(params) => (
              <TextField {...params} label={t("coworkers")} />
            )}
            sx={{ mt: 2, minWidth: 300 }}
          />
        )}
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("cancel")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || fetching}
          variant="contained"
        >
          {loading ? <CircularProgress size={20} /> : t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamEditModal;
