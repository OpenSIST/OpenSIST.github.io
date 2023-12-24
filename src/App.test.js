import { render, screen } from '@testing-library/react';
import TopBar from './Components/TopBar';

test('renders learn react link', () => {
  render(<TopBar />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
