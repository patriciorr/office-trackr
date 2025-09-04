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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordChecks({
      length: value.length >= 12,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
    });
  };

  const pwFormValid =
    oldPassword &&
    newPassword &&
    confirmPassword &&
    Object.values(passwordChecks).every(Boolean) &&
    newPassword === confirmPassword;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    setPwLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("update_failed"));
      setPwSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordChecks({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
      });
    } catch (err: any) {
      if (err.message.includes("PW001")) {
        setPwError(t("password_required"));
      } else if (err.message.includes("PW002")) {
        setPwError(t("password_strength"));
      } else if (err.message.includes("PW003")) {
        setPwError(t("password_common"));
      } else if (err.message.includes("PW004")) {
        setPwError(t("password_all_required"));
      } else if (err.message.includes("PW005")) {
        setPwError(t("password_mismatch"));
      } else if (err.message.includes("PW006")) {
        setPwError(t("user_not_found"));
      } else if (err.message.includes("PW007")) {
        setPwError(t("old_password_incorrect"));
      } else if (err.message.includes("PW008")) {
        setPwError(t("direct_password_failed"));
      } else {
        setPwError(t("password_update_failed"));
      }
    } finally {
      setPwLoading(false);
    }
  };

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
        method: "PATCH",
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
        setError(t("name_update_failed"));
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
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
        {t("edit_name")}
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
            {t("name_update_success")}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : t("change_name_button")}
        </Button>
      </form>

      <Typography variant="subtitle1" sx={{ mt: 4, mb: 1, fontWeight: 600 }}>
        {t("edit_password")}
      </Typography>
      <form onSubmit={handlePasswordSubmit}>
        <TextField
          margin="normal"
          fullWidth
          id="oldPassword"
          label={t("old_password")}
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value.trim())}
        />
        <TextField
          margin="normal"
          fullWidth
          id="newPassword"
          label={t("new_password")}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => handleNewPasswordChange(e.target.value.trim())}
        />
        <TextField
          margin="normal"
          fullWidth
          id="confirmPassword"
          label={t("confirm_password")}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value.trim())}
        />
        <Box sx={{ mt: 2, mb: 2 }}>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li style={{ color: passwordChecks.length ? "#888" : "#d0d0d0" }}>
              {t("password_length")}
            </li>
            <li
              style={{ color: passwordChecks.uppercase ? "#888" : "#d0d0d0" }}
            >
              {t("password_uppercase")}
            </li>
            <li
              style={{ color: passwordChecks.lowercase ? "#888" : "#d0d0d0" }}
            >
              {t("password_lowercase")}
            </li>
            <li style={{ color: passwordChecks.number ? "#888" : "#d0d0d0" }}>
              {t("password_number")}
            </li>
            <li style={{ color: passwordChecks.symbol ? "#888" : "#d0d0d0" }}>
              {t("password_symbol")}
            </li>
          </ul>
        </Box>
        {pwError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {pwError}
          </Alert>
        )}
        {pwSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("password_update_success")}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={!pwFormValid || pwLoading}
        >
          {pwLoading ? (
            <CircularProgress size={24} />
          ) : (
            t("change_password_button")
          )}
        </Button>
      </form>
      <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        {t("back")}
      </Button>
    </Box>
  );
};

export default UserEdit;
