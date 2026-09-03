import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import UserTable from "./UserTable";
import UserEditModal from "./UserEditModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import TeamEditModal from "./TeamEditModal";
import type { User } from "./UserTable";
import { useTranslation } from "react-i18next";
import { surfaceColors } from "../themeColors";

interface AdminPanelProps {
  isDarkMode?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isDarkMode = false }) => {
  const { t } = useTranslation();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editTeamUser, setEditTeamUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);

  return (
    <>
      <Paper
        sx={{
          width: "calc(100% - 32px)",
          maxWidth: 1200,
          mx: "auto",
          mt: { xs: 2, md: 4 },
          p: { xs: 2.5, md: 4 },
          borderRadius: 3,
          boxShadow: 3,
          background: isDarkMode ? surfaceColors.dark.paper : surfaceColors.light.paper,
          color: isDarkMode ? "#edf7f8" : "#183247",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t("admin_panel")}
        </Typography>
      </Paper>
      <Box sx={{ width: "calc(100% - 32px)", maxWidth: 1200, mx: "auto" }}>
        <UserTable
          onEdit={(user) => setEditUser(user)}
          onDelete={(user) => setDeleteUser(user)}
          onEditTeam={(user) => setEditTeamUser(user)}
          refresh={refreshTable}
        />
      </Box>
      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            setRefreshTable((r) => r + 1);
          }}
        />
      )}
      {deleteUser && (
        <ConfirmDeleteDialog
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => {
            setDeleteUser(null);
            setRefreshTable((r) => r + 1);
          }}
        />
      )}
      {editTeamUser && (
        <TeamEditModal
          user={editTeamUser}
          onClose={() => setEditTeamUser(null)}
          onSaved={() => {
            setEditTeamUser(null);
            setRefreshTable((r) => r + 1);
          }}
        />
      )}
    </>
  );
};

export default AdminPanel;
