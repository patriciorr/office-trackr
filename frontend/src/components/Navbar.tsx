import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  role?: "admin" | "manager" | "coworker";
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onLogout?: () => void;
  language: "es" | "en";
  onLanguageChange: (lang: "es" | "en") => void;
  minimal?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  role,
  onTabChange,
  activeTab,
  onLogout,
  language,
  onLanguageChange,
  minimal = false,
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      label: t("calendar"),
      value: "calendar",
    },
    ...(role === "manager"
      ? [{ label: t("dashboard"), value: "dashboard" }]
      : []),
    ...(role === "admin" ? [{ label: t("admin"), value: "admin" }] : []),
  ];
  return (
    <AppBar
      position="static"
      color={isDarkMode ? "default" : "inherit"}
      elevation={1}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src="/agenda.png" alt="Logo" style={{ height: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#555" }}>
            {t("app_name", { defaultValue: "OfficeTrackr" })}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!minimal &&
            tabs.map((tab, idx) => (
              <Button
                key={tab.value}
                onClick={() => onTabChange && onTabChange(tab.value)}
                color={activeTab === tab.value ? "primary" : "inherit"}
                sx={{
                  fontWeight: activeTab === tab.value ? 700 : 400,
                  borderBottom:
                    activeTab === tab.value ? "2px solid #1976d2" : "none",
                  borderRadius: 0,
                }}
              >
                {tab.label}
              </Button>
            ))}
          {!minimal && onLogout && (
            <Button
              onClick={onLogout}
              variant="contained"
              color="primary"
              sx={{ fontWeight: 600, ml: 2 }}
            >
              {t("logout")}
            </Button>
          )}
          <Button
            onClick={onToggleDarkMode}
            variant="outlined"
            color={isDarkMode ? "secondary" : "primary"}
            sx={{ minWidth: 40, ml: 2, borderRadius: "50%" }}
            title={isDarkMode ? t("light_mode") : t("dark_mode")}
          >
            {isDarkMode ? (
              <span role="img" aria-label={t("light_mode")}>
                🌞
              </span>
            ) : (
              <span role="img" aria-label={t("dark_mode")}>
                🌙
              </span>
            )}
          </Button>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={(_, lang) => lang && onLanguageChange(lang)}
            sx={{ ml: 2 }}
          >
            <ToggleButton
              value="es"
              sx={{ p: 0, borderRadius: "50%" }}
              title="Español"
            >
              <ReactCountryFlag
                countryCode="ES"
                svg
                style={{ width: 24, height: 24, borderRadius: "50%" }}
                title="Español"
              />
            </ToggleButton>
            <ToggleButton
              value="en"
              sx={{ p: 0, borderRadius: "50%" }}
              title="English"
            >
              <ReactCountryFlag
                countryCode="GB"
                svg
                style={{ width: 24, height: 24, borderRadius: "50%" }}
                title="English"
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
