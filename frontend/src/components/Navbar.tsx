import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import logoLight from "../assets/office-trackr-logo-light.svg";
import logoDark from "../assets/office-trackr-logo-dark.svg";
import TranslateIcon from "@mui/icons-material/Translate";

type LanguageCode = "es" | "en";

const languageOptions: Array<{
  code: LanguageCode;
  label: string;
  countryCode: string;
}> = [
  { code: "es", label: "Español", countryCode: "ES" },
  { code: "en", label: "English", countryCode: "GB" },
];

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  role?: "admin" | "manager" | "coworker";
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onLogout?: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:899px)");
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [navMenuAnchor, setNavMenuAnchor] = useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);

  const tabs = [
    { label: t("calendar"), value: "calendar", icon: <CalendarMonthIcon fontSize="small" /> },
    ...(role === "manager"
      ? [{ label: t("dashboard"), value: "dashboard", icon: <DashboardIcon fontSize="small" /> }]
      : []),
    ...(role === "admin"
      ? [{ label: t("admin"), value: "admin", icon: <AdminPanelSettingsIcon fontSize="small" /> }]
      : []),
  ];

  const handleTabClick = (tab: string) => {
    setNavMenuAnchor(null);
    onTabChange?.(tab);
    navigate(tab === "calendar" ? "/" : `/${tab}`);
  };

  const handleLanguageChange = (nextLanguage: LanguageCode) => {
    onLanguageChange(nextLanguage);
    setLanguageMenuAnchor(null);
    setNavMenuAnchor(null);
  };

  const handleLogoClick = () => {
    navigate("/");
    onTabChange?.("calendar");
  };

  const handleLogout = () => {
    setUserMenuAnchor(null);
    navigate("/");
    onLogout?.();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 76 },
          px: { xs: 1.5, sm: 3, md: 5 },
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, minWidth: 0 }}>
          <Box
            component="img"
            src={isDarkMode ? logoDark : logoLight}
            alt="Logo"
            onClick={handleLogoClick}
            sx={{ height: { xs: 30, md: 36 }, width: "auto", cursor: "pointer" }}
          />
          <Typography
            variant="h6"
            onClick={handleLogoClick}
            sx={{
              fontWeight: 800,
              color: "text.primary",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: { xs: "1.05rem", md: "1.3rem" },
            }}
          >
            {t("app_name", { defaultValue: "OfficeTrackr" })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 1 }, ml: "auto" }}>
          {!minimal && !isMobile && tabs.map((tab) => (
            <Button
              key={tab.value}
              startIcon={tab.icon}
              onClick={() => handleTabClick(tab.value)}
              color={activeTab === tab.value ? "primary" : "inherit"}
              sx={{
                fontWeight: activeTab === tab.value ? 800 : 600,
                borderBottom: activeTab === tab.value ? "2px solid" : "2px solid transparent",
                borderRadius: 0,
              }}
            >
              {tab.label}
            </Button>
          ))}
          {!minimal && isMobile && (
            <>
              <IconButton color="inherit" onClick={(event) => setNavMenuAnchor(event.currentTarget)} aria-label={t("open_navigation")}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={navMenuAnchor} open={Boolean(navMenuAnchor)} onClose={() => setNavMenuAnchor(null)}>
                {tabs.map((tab) => (
                  <MenuItem key={tab.value} onClick={() => handleTabClick(tab.value)}>
                    {tab.icon}
                    <Typography sx={{ ml: 1 }}>{tab.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <IconButton color="inherit" onClick={onToggleDarkMode} aria-label={isDarkMode ? t("light_mode") : t("dark_mode")}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={(event) => setLanguageMenuAnchor(event.currentTarget)}
            aria-label={t("change_language")}
            title={t("change_language")}
          >
            <TranslateIcon />
          </IconButton>
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={() => setLanguageMenuAnchor(null)}
          >
            {languageOptions.map((option) => (
              <MenuItem
                key={option.code}
                selected={language === option.code}
                onClick={() => handleLanguageChange(option.code)}
              >
                <ReactCountryFlag countryCode={option.countryCode} svg />
                <Typography sx={{ ml: 1 }}>{option.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
          {user && (
            <>
              <IconButton onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={t("edit_user")}>
                <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "0.85rem", fontWeight: 800 }}>
                  {`${user.firstName?.[0] ?? "U"}${user.lastName?.[0] ?? "N"}`}
                </Avatar>
              </IconButton>
              <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)}>
                <MenuItem onClick={() => { navigate("/edit-user"); setUserMenuAnchor(null); }}>{t("edit_user")}</MenuItem>
                <MenuItem onClick={handleLogout}>{t("logout")}</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
