import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import UserTable from "./UserTable";
import UserEditModal from "./UserEditModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import TeamEditModal from "./TeamEditModal";
import type { User } from "./UserTable";
import { useTranslation } from "react-i18next";

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
          maxWidth: 400,
          mx: "auto",
          mt: 4,
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          background: isDarkMode ? "#232946" : "#fff",
          color: isDarkMode ? "#eaf0fa" : "#232946",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          {t("admin_panel")}
        </Typography>
      </Paper>
      <UserTable
        onEdit={(user) => setEditUser(user)}
        onDelete={(user) => setDeleteUser(user)}
        onEditTeam={(user) => setEditTeamUser(user)}
        refresh={refreshTable}
      />
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
