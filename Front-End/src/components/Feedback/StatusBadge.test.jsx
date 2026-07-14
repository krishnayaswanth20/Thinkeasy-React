import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the status label', () => {
    render(<StatusBadge status="Planned" />);
    expect(screen.getByText(/Planned/)).toBeInTheDocument();
  });

  it('falls back to the "Under Review" style for an unknown status', () => {
    render(<StatusBadge status="Something Else" />);
    expect(screen.getByText(/Something Else/).className).toContain('s-under-review');
  });
});
