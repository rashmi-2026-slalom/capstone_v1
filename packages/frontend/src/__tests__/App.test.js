import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders the header', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Your App/i)).toBeInTheDocument();
  });

  test('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Start building your application here/i)).toBeInTheDocument();
  });
});