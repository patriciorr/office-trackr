import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";

interface FooterProps {
  isDarkMode: boolean;
  language: string;
  minimal?: boolean;
}

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      <Link
        href="https://patriciorr.github.io/" //TODO: complete when personal website is ready
        sx={{
          color: "text.secondary",
        }}
      >
        Patricio Rodríguez
      </Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

const Footer: React.FC<FooterProps> = ({ isDarkMode, language, minimal }) => {
  const { t } = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 4, sm: 8 },
          py: { xs: 8, sm: 10 },
          textAlign: { sm: "center", md: "left" },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: "medium",
            color: "text.secondary",
            cursor: "default",
            whiteSpace: "nowrap",
            fontSize: "body2.fontSize",
          }}
        >
          {t("footer_message")}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "left", color: "text.secondary" }}
        >
          <IconButton
            color="inherit"
            size="small"
            href="mailto:patriciorodriguezramirez@gmail.com"
            aria-label="Email"
            sx={{ alignSelf: "center" }}
          >
            <EmailIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://github.com/patriciorr"
            aria-label="GitHub"
            sx={{ alignSelf: "center" }}
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://www.linkedin.com/in/patriciorr/"
            aria-label="LinkedIn"
            sx={{ alignSelf: "center" }}
          >
            <LinkedInIcon />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
