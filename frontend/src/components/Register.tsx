import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

interface RegisterProps {
  onRegister: (token: string, user: any) => void;
  language: "es" | "en";
  onLanguageChange: (lang: "es" | "en") => void;
  isDarkMode?: boolean;
  onToggleDarkMode: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onRegister,
  language,
  onLanguageChange,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("coworker");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordChecks({
      length: value.length >= 12,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("register_failed"));

      const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || t("login_failed"));
      onRegister(loginData.token, loginData.user);
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
      } else if (err.message.includes("EM001")) {
        setError(t("email_required"));
      } else if (err.message.includes("EM002")) {
        setError(t("email_format"));
      } else if (err.message.includes("EM003")) {
        setError(t("email_registered"));
      } else if (err.message.includes("PW001")) {
        setError(t("password_required"));
      } else if (err.message.includes("PW002")) {
        setError(t("password_strength"));
      } else if (err.message.includes("PW003")) {
        setError(t("password_common"));
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        language={language}
        onLanguageChange={onLanguageChange}
        minimal
      />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          background: isDarkMode ? "#232946" : "#f4f4f4",
          color: isDarkMode ? "#eaf0fa" : "#232946",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          {t("register_title")}
        </Typography>
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
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={t("email")}
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label={t("password")}
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value.trim())}
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-label">{t("role")}</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label={t("role")}
            onChange={(e) => setRole(e.target.value as string)}
          >
            <MenuItem value="coworker">{t("role_coworker")}</MenuItem>
            <MenuItem value="manager">{t("role_manager")}</MenuItem>
          </Select>
        </FormControl>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || Object.values(passwordChecks).includes(false)}
          sx={{ fontWeight: 600 }}
        >
          {loading ? t("registering") : t("register_button")}
        </Button>
      </Box>
    </>
  );
};

export default Register;
