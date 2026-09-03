import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  TableFooter,
  TablePagination,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from "react-i18next";

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: { xs: 0, md: 1 }, display: "flex" }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label={t("first_page")}
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label={t("previous_page")}
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={t("next_page")}
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label={t("last_page")}
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  team?: string[];
}

interface UserTableProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onEditTeam: (user: User) => void;
  refresh: number;
}

const UserTable: React.FC<UserTableProps> = ({
  onEdit,
  onDelete,
  onEditTeam,
  refresh,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/users?roles=coworker,manager", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: { xs: 2, md: 4 },
        overflowX: "auto",
        fontFamily: "inherit",
      }}
    >
      {isMobile ? (
        <Box sx={{ p: 1.5 }}>
          {(rowsPerPage > 0
            ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : users
          ).map((user) => (
            <Paper key={user.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    {user.email}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                  {t("role")}: {user.role}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title={t("edit_user")}>
                    <IconButton onClick={() => onEdit(user)} color="primary" aria-label={t("edit_user")}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {user.role === "manager" && (
                    <Tooltip title={t("edit_team")}>
                      <IconButton onClick={() => onEditTeam(user)} color="primary" aria-label={t("edit_team")}>
                        <GroupIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("delete_user")}>
                    <IconButton onClick={() => onDelete(user)} color="error" aria-label={t("delete_user")}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          ))}
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, { label: t("table_all"), value: -1 }]}
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            slotProps={{ select: { inputProps: { "aria-label": t("table_rows_per_page") }, native: true } }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
            sx={{
              width: "100%",
              overflow: "hidden",
              "& .MuiTablePagination-toolbar": {
                minHeight: 52,
                px: { xs: 0.5, sm: 1 },
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: 0.5,
              },
              "& .MuiTablePagination-spacer": { display: "none" },
              "& .MuiTablePagination-selectLabel": { m: 0 },
              "& .MuiTablePagination-displayedRows": { m: 0 },
            }}
          />
        </Box>
      ) : (
      <Table
        sx={{
          minWidth: 680,
          "& .MuiTableCell-root": {
            fontFamily: "inherit",
            fontSize: "0.9rem",
            color: "text.primary",
          },
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 800,
            color: "text.secondary",
            backgroundColor: "action.hover",
            whiteSpace: "nowrap",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t("first_name")}</TableCell>
            <TableCell>{t("last_name")}</TableCell>
            <TableCell>{t("email")}</TableCell>
            <TableCell>{t("role")}</TableCell>
            <TableCell align="right">{t("actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : users
          ).map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell align="right">
                <Tooltip title={t("edit_user")}>
                  <IconButton onClick={() => onEdit(user)} size="small" color="primary" aria-label={t("edit_user")}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {user.role === "manager" && (
                  <Tooltip title={t("edit_team")}>
                    <IconButton onClick={() => onEditTeam(user)} size="small" color="primary" aria-label={t("edit_team")}>
                      <GroupIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t("delete_user")}>
                  <IconButton
                    onClick={() => onDelete(user)}
                    size="small"
                    color="error"
                    aria-label={t("delete_user")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, { label: t("table_all"), value: -1 }]}
              colSpan={3}
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  inputProps: {
                    "aria-label": t("table_rows_per_page"),
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              sx={{
                "& .MuiTablePagination-toolbar": { fontFamily: "inherit" },
              }}
            />
          </TableRow>
        </TableFooter>
      </Table>
      )}
    </TableContainer>
  );
};

export default UserTable;
