import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar.jsx';

function setup(props = {}) {
  const onSearch = props.onSearch ?? vi.fn();
  const onDemo = props.onDemo ?? vi.fn();
  const loading = props.loading ?? false;
  render(<SearchBar onSearch={onSearch} onDemo={onDemo} loading={loading} />);
  return { onSearch, onDemo };
}

describe('SearchBar — rendering', () => {
  it('renders the search input and both buttons', () => {
    setup();
    expect(screen.getByPlaceholderText(/steam id or custom url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demo mode/i })).toBeInTheDocument();
  });

  it('Search button is disabled when the input is empty', () => {
    setup();
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('Search button is enabled after typing', async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText(/steam id or custom url/i), '76561198189486707');
    expect(screen.getByRole('button', { name: /search/i })).toBeEnabled();
  });
});

describe('SearchBar — interactions', () => {
  it('calls onSearch with the trimmed input on form submit', async () => {
    const { onSearch } = setup();
    await userEvent.type(screen.getByPlaceholderText(/steam id or custom url/i), '  gaben  ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('gaben');
  });

  it('calls onSearch when Enter is pressed in the input', async () => {
    const { onSearch } = setup();
    const input = screen.getByPlaceholderText(/steam id or custom url/i);
    await userEvent.type(input, '76561198189486707{Enter}');
    expect(onSearch).toHaveBeenCalledWith('76561198189486707');
  });

  it('calls onDemo when Demo Mode button is clicked', async () => {
    const { onDemo } = setup();
    await userEvent.click(screen.getByRole('button', { name: /demo mode/i }));
    expect(onDemo).toHaveBeenCalledOnce();
  });

  it('does not call onSearch when input is whitespace only', async () => {
    const { onSearch } = setup();
    await userEvent.type(screen.getByPlaceholderText(/steam id or custom url/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(onSearch).not.toHaveBeenCalled();
  });
});

describe('SearchBar — loading state', () => {
  it('disables input and Search button while loading', () => {
    setup({ loading: true });
    expect(screen.getByPlaceholderText(/steam id or custom url/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /\.\.\./i })).toBeDisabled();
  });

  it('shows "..." on the Search button while loading', () => {
    setup({ loading: true });
    expect(screen.getByRole('button', { name: /\.\.\./i })).toBeInTheDocument();
  });
});
