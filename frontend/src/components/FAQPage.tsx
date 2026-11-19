import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

const faqItems = [
  {
    id: "calendar",
    question: "faq_calendar_question",
    answer: "faq_calendar_answer",
  },
  {
    id: "target",
    question: "faq_target_question",
    answer: "faq_target_answer",
  },
  {
    id: "data",
    question: "faq_data_question",
    answer: "faq_data_answer",
  },
  {
    id: "roles",
    question: "faq_roles_question",
    answer: "faq_roles_answer",
  },
];

const FAQPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {t("faq_title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("faq_intro")}
      </Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>
        {t("faq_prototype_warning")}
      </Alert>
      <Stack spacing={1.5}>
        {faqItems.map(({ id, question, answer }) => (
          <Accordion key={id} disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              id={`faq-${id}-header`}
              aria-controls={`faq-${id}-content`}
            >
              <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                {t(question)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                component="div"
                id={`faq-${id}-content`}
                role="region"
                aria-labelledby={`faq-${id}-header`}
              >
                {t(answer)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Container>
  );
};

export default FAQPage;
