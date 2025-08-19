import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import ReactCountryFlag from "react-country-flag";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
  language: "es" | "en";
  onLanguageChange: (lang: "es" | "en") => void;
  isDarkMode?: boolean;
  onToggleDarkMode: () => void;
}

const Login: React.FC<LoginProps> = ({
  onLogin,
  language,
  onLanguageChange,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("login_failed"));
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          {t("login_title")}
        </Typography>
        <TextField
          label={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ fontWeight: 600 }}
        >
          {loading ? t("logging_in") : t("login_button")}
        </Button>
      </Box>
    </>
  );
};

export default Login;
