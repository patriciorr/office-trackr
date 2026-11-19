import {afterEach, describe, expect, it} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import FAQPage from '../../../src/components/FAQPage';
import i18n from '../../../src/locales/i18n';

const localeHeadings = [
  ['es', 'Preguntas frecuentes', 'prototipo personal'],
  ['en', 'Frequently asked questions', 'personal portfolio prototype'],
  ['fr', 'Questions fréquentes', 'prototype personnel'],
  ['pt', 'Perguntas frequentes', 'protótipo pessoal'],
] as const;

describe('FAQPage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('es');
  });

  it.each(localeHeadings)('renders the FAQ and data warning in %s', async (language, heading, warning) => {
    await i18n.changeLanguage(language);
    renderWithProviders(<FAQPage />);

    expect(screen.getByRole('heading', {name: heading, level: 1})).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(warning);
  });

  it('reveals the calendar instructions when its accordion is opened', async () => {
    await i18n.changeLanguage('es');
    renderWithProviders(<FAQPage />);

    fireEvent.click(screen.getByRole('button', {name: '¿Cómo uso el calendario?'}));

    await waitFor(() => {
      expect(screen.getByText(/Selecciona una fecha y elige Oficina o Vacaciones/)).toBeVisible();
    });
  });
});
