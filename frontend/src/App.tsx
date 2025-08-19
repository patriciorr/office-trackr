import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import MonthEventCounter from "./components/MonthEventCounter";
import Login from "./components/Login";
import Register from "./components/Register";
import CalendarWorkdays from "./components/CalendarWorkdays";
import { CalendarEvent } from "./components/Calendar";
import DayEventModal from "./components/DayEventModal";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminPanel from "./components/AdminPanel";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import esLocale from "./locales/es/muiLocaleEs";
import enLocale from "./locales/en/muiLocaleEn";
import { muiLocales } from "./locales/muiLocales";
import { useTranslation } from "react-i18next";

interface WorkerSummary {
  userId: string;
  name: string;
  officeDays: number;
  vacationDays: number;
  wfaDays: number;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<"es" | "en">(() => {
    return (localStorage.getItem("language") as "es" | "en") || "es";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("isDarkMode");
    return stored ? stored === "true" : false;
  });

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  // Solo eventos filtrados por mes
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
  // Identificadores de pestañas: 'calendar', 'dashboard', 'admin'
  const [activeTab, setActiveTab] = useState<'calendar' | 'dashboard' | 'admin'>("calendar");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<[Date, Date] | undefined>(
    undefined
  );
  // Estado para mes/año actual del calendario
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [workerSummaries, setWorkerSummaries] = useState<WorkerSummary[]>([]);

  // Restaurar sesión desde localStorage al cargar la app
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Sincronizar idioma de i18n y persistir modo oscuro/idioma en localStorage
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n]);

  useEffect(() => {
    localStorage.setItem("isDarkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  // Cargar eventos del backend al iniciar sesión
  // Elimina allEvents y la lógica de eventos globales

  // Cargar eventos filtrados por mes/año para el contador
  useEffect(() => {
    if (token && user) {
      const params = new URLSearchParams({
        userId: user._id,
        year: calendarYear.toString(),
        month: (calendarMonth + 1).toString(), // backend espera 1-12
      });
      fetch(`http://localhost:5000/api/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setMonthEvents(data))
        .catch(() => setMonthEvents([]));
    }
  }, [token, user, calendarYear, calendarMonth]);

  // Simulación de roles, reemplazar por lógica real
  const role = user?.role || "coworker";

  useEffect(() => {
    if (activeTab === t("dashboard") && role === "manager") {
      // Aquí iría la llamada real al backend para obtener los resúmenes
      // Ejemplo de datos simulados:
      setWorkerSummaries([
        {
          userId: "1",
          name: "Ana López",
          officeDays: 12,
          vacationDays: 2,
          wfaDays: 6,
        },
        {
          userId: "2",
          name: "Juan Pérez",
          officeDays: 10,
          vacationDays: 4,
          wfaDays: 6,
        },
        {
          userId: "3",
          name: "Sara Ruiz",
          officeDays: 15,
          vacationDays: 0,
          wfaDays: 5,
        },
      ]);
    }
  }, [activeTab, role]);

  // Guardar sesión en localStorage al login
  const handleLogin = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Logout seguro y limpieza de sesión
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Expiración automática del token (según estándar JWT)
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp) {
        const expMs = payload.exp * 1000;
        const now = Date.now();
        if (expMs < now) {
          handleLogout();
          setFeedback({
            type: "error",
            message: t("expired"),
          });
        } else {
          const timeout = setTimeout(() => {
            handleLogout();
            setFeedback({
              type: "error",
              message: t("expired"),
            });
          }, expMs - now);
          return () => clearTimeout(timeout);
        }
      }
    } catch {}
  }, [token]);

  const handleRegister = (token: string, user: any) => {
    setShowRegister(false);
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Abrir modal al hacer click en un día
  const handleSelectDay = (date: Date) => {
    const isoDate = date.toISOString().slice(0, 10);
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
    setModalOpen(true);
  };

  const handleSelectRange = (start: Date, end: Date) => {
    // Para el prototipo, solo abrimos el modal para el rango inicial
    handleSelectDay(start);
  };

  // Guardar evento (añadir o editar)
  const handleSaveEvent = async (event: CalendarEvent) => {
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url =
        modalMode === "edit"
          ? `http://localhost:5000/api/events/${event._id}`
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
        message: "Evento guardado correctamente.",
      });
      // Recargar eventos filtrados tras guardar
      const params = new URLSearchParams({
        userId: user._id,
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
      setFeedback({ type: "error", message: "Error guardando evento" });
    }
    setModalOpen(false);
    setSelectedDate(null);
    setModalEvent(undefined);
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    try {
      if (!modalEvent) return;
      const res = await fetch(
        `http://localhost:5000/api/events/${modalEvent._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error eliminando evento");
      setFeedback({
        type: "success",
        message: "Evento eliminado correctamente.",
      });
      // Recargar eventos filtrados tras eliminar
      const params = new URLSearchParams({
        userId: user._id,
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
      setFeedback({ type: "error", message: "Error eliminando evento" });
    }
    setModalOpen(false);
    setSelectedDate(null);
    setModalEvent(undefined);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setModalEvent(undefined);
  };

  const handleAddHoliday = async (date: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, type: "holiday" }),
      });
      if (!res.ok) throw new Error("Error agregando festivo");
      setFeedback({ type: "success", message: "Festivo nacional agregado." });
      // Recargar eventos filtrados tras agregar festivo
      const params = new URLSearchParams({
        userId: user._id,
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
      setFeedback({ type: "error", message: "Error agregando festivo" });
    }
  };

  const handleAddConcentration = async (date: string, note?: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, type: "concentration", note }),
      });
      if (!res.ok) throw new Error("Error agregando día de concentración");
      setFeedback({
        type: "success",
        message: "Día de concentración agregado.",
      });
      // Recargar eventos filtrados tras agregar concentración
      const params = new URLSearchParams({
        userId: user._id,
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
      setFeedback({
        type: "error",
        message: "Error agregando día de concentración",
      });
    }
  };

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: { main: isDarkMode ? "#4b6cb7" : "#1976d2" },
      secondary: { main: isDarkMode ? "#6a89cc" : "#90caf9" },
      background: {
        default: isDarkMode ? "#232946" : "#eaf0fa",
        paper: isDarkMode ? "#1a1f2b" : "#fff",
      },
      text: {
        primary: isDarkMode ? "#eaf0fa" : "#232946",
        secondary: isDarkMode ? "#b8c1ec" : "#6a89cc",
      },
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
    components: {
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#232946" : "#eaf0fa",
            color: isDarkMode ? "#eaf0fa" : "#232946",
            border: "1px solid #90caf9",
          },
        },
      },
    },
  });

  if (!token) {
    return (
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
    );
  }

  return (
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
        onTabChange={(tab) => {
          // Solo permite los tabs válidos
          if (["calendar", "dashboard", "admin"].includes(tab)) {
            setActiveTab(tab as "calendar" | "dashboard" | "admin");
          }
        }}
        activeTab={activeTab}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          i18n.changeLanguage(lang);
        }}
      />
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={language === "es" ? esLocale : enLocale}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          {activeTab === "calendar" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                gap: 3,
              }}
            >
              {/* Contador de eventos mensual */}
              <Box
                sx={{ width: { xs: "100%", md: "33%" }, mb: { xs: 2, md: 0 } }}
              >
                <MonthEventCounter
                  events={monthEvents}
                  year={calendarYear}
                  month={calendarMonth}
                  isDarkMode={isDarkMode}
                />
              </Box>
              {/* Calendario principal */}
              <Box sx={{ flex: 1, width: { xs: "100%", md: "67%" } }}>
                <CalendarWorkdays
                  events={monthEvents}
                  onSelectDay={handleSelectDay}
                  isDarkMode={isDarkMode}
                  onMonthChange={(year: number, month: number) => {
                    setCalendarYear(year);
                    setCalendarMonth(month);
                  }}
                />
              </Box>
            </Box>
          )}
          {activeTab === "dashboard" && role === "manager" && (
            <ManagerDashboard
              summaries={workerSummaries}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === "admin" && role === "admin" && (
            <AdminPanel
              onAddHoliday={handleAddHoliday}
              onAddConcentration={handleAddConcentration}
              isDarkMode={isDarkMode}
            />
          )}
        </Container>
      </LocalizationProvider>
      {modalOpen && modalDate && (
        <DayEventModal
          date={modalDate}
          event={modalEvent}
          onSave={handleSaveEvent}
          onDelete={modalEvent ? handleDeleteEvent : undefined}
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
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
  );
};

export default App;
