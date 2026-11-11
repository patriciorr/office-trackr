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
});
