import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import Footer from '../../../src/components/Footer';

describe('Footer', () => {
  it('links to the application source and AGPL license', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', {name: 'Código fuente'}))
      .toHaveAttribute('href', 'https://github.com/patriciorr/office-trackr');
    expect(screen.getByRole('link', {name: 'AGPL-3.0'}))
      .toHaveAttribute('href', 'https://github.com/patriciorr/office-trackr/blob/main/LICENSE');
  });

  it('links to the FAQ page', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', {name: 'Preguntas frecuentes'}))
      .toHaveAttribute('href', '/faq');
  });

  it('opens external websites in a new tab while preserving the email link', () => {
    renderWithProviders(<Footer />);

    for (const name of ['GitHub', 'LinkedIn', 'AGPL-3.0', 'Código fuente']) {
      const link = screen.getByRole('link', {name});
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    expect(screen.getByRole('link', {name: 'Email'})).not.toHaveAttribute('target', '_blank');
  });
});
