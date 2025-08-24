import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../context/AuthContext";

const UserEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!firstName.trim() || !lastName.trim()) {
      setError(t("fields_required"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      updateUser(updated);
      setSuccess(true);
    } catch (err: any) {
      if (err.message.includes("FN001")) {
        setError(t("first_name_required"));
      } else if (err.message.includes("FN002")) {
        setError(t("first_name_length"));
      } else if (err.message.includes("FN003")) {
        setError(t("first_name_format"));
      } else if (err.message.includes("LN001")) {
        setError(t("last_name_required"));
      } else if (err.message.includes("LN002")) {
        setError(t("last_name_length"));
      } else if (err.message.includes("LN003")) {
        setError(t("last_name_format"));
      } else {
        setError(t("update_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 6,
        p: 3,
        boxShadow: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("edit_user")}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="firstName"
          label={t("first_name")}
          name="firstName"
          autoComplete="firstName"
          autoFocus
          value={firstName}
          onChange={(e) => setFirstName(e.target.value.trim())}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="lastName"
          label={t("last_name")}
          name="lastName"
          autoComplete="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value.trim())}
          sx={{ mb: 2 }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("update_success")}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : t("edit_button")}
        </Button>
      </form>
      <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        {t("back")}
      </Button>
    </Box>
  );
};

export default UserEdit;
