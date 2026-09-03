import React, { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import Counter from "./components/Counter";
import Login from "./components/Login";
import Register from "./components/Register";
import Calendar, { CalendarEvent } from "./components/Calendar";
import DayEventModal from "./components/DayEventModal";
import DayEventPanel from "./components/DayEventPanel";
import Navbar from "./components/Navbar";
import UserEdit from "./components/UserEdit";
import { AuthContext } from "./context/AuthContext";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminPanel from "./components/AdminPanel";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "./locales/es/muiLocaleEs";
import enLocale from "./locales/en/muiLocaleEn";
import { muiLocales } from "./locales/muiLocales";
import { useTranslation } from "react-i18next";
import "./App.css";
import { surfaceColors } from "./themeColors";

interface WorkerSummary {
  userId: string;
  name: string;
  officeDays: number;
  vacationDays: number;
  wfaDays: number;
}

const App: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const role = user?.role || "coworker";
  const { t, i18n } = useTranslation();
  const isSmallScreen = useMediaQuery("(max-width:899px)");
  const [language, setLanguage] = useState<"es" | "en">(() => {
    return (localStorage.getItem("language") as "es" | "en") || "es";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("isDarkMode");
    return stored ? stored === "true" : false;
  });

  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEvent, setModalEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "dashboard" | "admin"
  >("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | undefined>(
    undefined
  );
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n]);

  useEffect(() => {
    localStorage.setItem("isDarkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  useEffect(() => {
    if (token && user) {
      const params = new URLSearchParams({
        userId: user.id,
        year: calendarYear.toString(),
        month: (calendarMonth + 1).toString(),
      });
      fetch(`http://localhost:5000/api/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => setMonthEvents(data))
        .catch(() => setMonthEvents([]));
    }
  }, [token, user, calendarYear, calendarMonth]);

  const handleLogin = (token: string, userObj: any) => {
    setToken(token);
    setUser(userObj);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp) {
        const expMs = payload.exp * 1000;
        const now = Date.now();
        if (expMs < now) {
          handleLogout();
          setFeedback({ type: "error", message: t("expired") });
        } else {
          const timeout = setTimeout(() => {
            handleLogout();
            setFeedback({ type: "error", message: t("expired") });
          }, expMs - now);
          return () => clearTimeout(timeout);
        }
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isSmallScreen) {
      setModalOpen(false);
    }
  }, [isSmallScreen]);

  const handleRegister = (token: string, userObj: any) => {
    setShowRegister(false);
    setToken(token);
    setUser(userObj);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const formatLocalDate = (date: Date) => {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}`;
  };

  const handleSelectDay = (date: Date) => {
    const isoDate = formatLocalDate(date);
    setModalDate(isoDate);
    const event = monthEvents.find((e) => {
      const eventDate =
        typeof e.date === "string"
          ? e.date.slice(0, 10)
          : new Date(e.date).toISOString().slice(0, 10);
      return eventDate === isoDate;
    });
    setModalEvent(event);
    setModalMode(event ? "edit" : "add");
    setModalOpen(isSmallScreen);
  };

  // TODO: Implement range selection
  const handleSelectRange = (start: Date, end: Date) => {
    handleSelectDay(start);
  };

  const handleSaveEvent = async (event: CalendarEvent) => {
    if (!token || !user) return;
    try {
      const method = event.id ? "PUT" : "POST";
      const url =
        event.id
          ? `http://localhost:5000/api/events/${event.id}`
          : "http://localhost:5000/api/events";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Error guardando evento");
      setFeedback({
        type: "success",
        message: t("event_saved"),
      });

      const params = new URLSearchParams({
        userId: user.id,
        year: calendarYear.toString(),
        month: (calendarMonth + 1).toString(),
      });
      const updated = await fetch(
        `http://localhost:5000/api/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMonthEvents(await updated.json());
    } catch {
      setFeedback({ type: "error", message: t("event_error") });
    }
    if (isSmallScreen) {
      setModalOpen(false);
      setSelectedDate(null);
      setModalEvent(undefined);
    } else {
      setModalEvent(event);
    }
  };

  const handleDeleteEvent = async (eventToDelete = modalEvent) => {
    if (!token || !user) return;
    try {
      if (!eventToDelete?.id) {
        setFeedback({ type: "error", message: t("delete_error") });
        return;
      }
      const res = await fetch(
        `http://localhost:5000/api/events/${eventToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error eliminando evento");
      setMonthEvents((previousEvents) =>
        previousEvents.filter((event) => event.id !== eventToDelete.id),
      );
      setFeedback({
        type: "success",
        message: t("event_deleted"),
      });

      const params = new URLSearchParams({
        userId: user.id,
        year: calendarYear.toString(),
        month: (calendarMonth + 1).toString(),
      });
      const updated = await fetch(
        `http://localhost:5000/api/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      setMonthEvents(await updated.json());
    } catch {
      setFeedback({ type: "error", message: t("delete_error") });
    }
    if (isSmallScreen) {
      setModalOpen(false);
      setSelectedDate(null);
      setModalEvent(undefined);
    } else {
      setModalEvent(undefined);
      setModalDate(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setModalEvent(undefined);
  };

  const surfaces = isDarkMode ? surfaceColors.dark : surfaceColors.light;
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: { main: isDarkMode ? "#67d9e8" : "#1769aa" },
      secondary: { main: isDarkMode ? "#f6c85f" : "#c48600" },
      background: {
        default: surfaces.background,
        paper: surfaces.paper,
      },
      text: {
        primary: isDarkMode ? "#edf7f8" : "#183247",
        secondary: isDarkMode ? "#a9c2c7" : "#557083",
      },
    },
    typography: {
      fontFamily: "'Manrope', sans-serif",
      h1: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
      h2: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
      h3: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
      h4: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
      h5: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
      h6: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    },
    components: {
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: surfaces.raised,
            color: isDarkMode ? "#edf7f8" : "#183247",
            border: `1px solid ${surfaces.border}`,
          },
        },
      },
    },
  });

  if (!token) {
    return (
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="sm" sx={{ py: 4 }}>
            {showRegister ? (
              <>
                <Register
                  onRegister={handleRegister}
                  language={language}
                  onLanguageChange={(lang) => {
                    setLanguage(lang);
                    i18n.changeLanguage(lang);
                  }}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode((v) => !v)}
                />
                <Button
                  variant="text"
                  onClick={() => setShowRegister(false)}
                  sx={{ mt: 2 }}
                >
                  {t("already_have_account")}
                </Button>
              </>
            ) : (
              <>
                <Login
                  onLogin={handleLogin}
                  language={language}
                  onLanguageChange={(lang) => {
                    setLanguage(lang);
                    i18n.changeLanguage(lang);
                  }}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode((v) => !v)}
                />
                <Button
                  variant="text"
                  onClick={() => setShowRegister(true)}
                  sx={{ mt: 2 }}
                >
                  {t("no_account")}
                </Button>
              </>
            )}
          </Container>
        </ThemeProvider>
      </Router>
    );
  }

  return (
    <Router>
      <ThemeProvider
        theme={{
          ...theme,
          ...(language === "es" ? muiLocales.es : muiLocales.en),
        }}
      >
        <CssBaseline />
        <Navbar
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((v) => !v)}
          role={role}
          onTabChange={(tab: string) => {
            if (["calendar", "dashboard", "admin"].includes(tab)) {
              setActiveTab(tab as "calendar" | "dashboard" | "admin");
            }
          }}
          activeTab={activeTab}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={(lang: "es" | "en") => {
            setLanguage(lang);
            i18n.changeLanguage(lang);
          }}
        />
        <Routes>
          <Route
            path="/"
            element={
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={language === "es" ? esLocale : enLocale}
              >
                <>
                  <Container maxWidth="lg" sx={{ py: 4 }}>
                    {activeTab === "calendar" && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          alignItems: { xs: "center", md: "flex-start" },
                          gap: 3,
                        }}
                      >
                      <Box
                        sx={{
                          width: { xs: "100%", md: "28%" },
                          flex: { xs: "none", md: 1.25 },
                          mb: { xs: 2, md: 0 },
                          order: { xs: 2, md: 1 },
                        }}
                      >
                        <Counter
                          events={monthEvents}
                          year={calendarYear}
                          month={calendarMonth}
                          isDarkMode={isDarkMode}
                        />
                      </Box>
                      <Box
                        sx={{
                          flex: { xs: "none", md: 1.8 },
                          width: { xs: "100%", md: "auto" },
                          order: { xs: 1, md: 2 },
                        }}
                      >
                        <Calendar
                          events={monthEvents}
                          onSelectDay={handleSelectDay}
                          isDarkMode={isDarkMode}
                          onMonthChange={(year: number, month: number) => {
                            setCalendarYear(year);
                            setCalendarMonth(month);
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          flex: { xs: "none", md: 1.2 },
                          width: { xs: "100%", md: "auto" },
                          order: 3,
                          display: { xs: "none", md: "block" },
                        }}
                      >
                        {modalDate && (
                          <DayEventPanel
                            date={modalDate}
                            event={monthEvents.find(
                              (event) => event.date.slice(0, 10) === modalDate,
                            )}
                            onSave={handleSaveEvent}
                            onDelete={handleDeleteEvent}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </Box>
                      </Box>
                    )}
                  </Container>
                  {isSmallScreen && modalOpen && modalDate && (
                    <DayEventModal
                      date={modalDate}
                      event={modalEvent}
                      onSave={handleSaveEvent}
                      onDelete={modalEvent ? handleDeleteEvent : undefined}
                      onClose={handleCloseModal}
                      isDarkMode={isDarkMode}
                    />
                  )}
                </>
              </LocalizationProvider>
            }
          />
          <Route path="/edit-user" element={<UserEdit />} />
          <Route
            path="/dashboard"
            element={
              role === "manager" ? (
                <ManagerDashboard isDarkMode={isDarkMode} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              role === "admin" ? (
                <AdminPanel isDarkMode={isDarkMode} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
        <Snackbar
          open={!!feedback}
          autoHideDuration={4000}
          onClose={() => setFeedback(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {feedback ? (
            <Alert severity={feedback.type} sx={{ width: "100%" }}>
              {feedback.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </ThemeProvider>
    </Router>
  );
};

export default App;
