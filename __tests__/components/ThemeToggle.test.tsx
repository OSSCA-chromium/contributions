import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

test('토글 클릭 시 dark 클래스와 localStorage가 토글된다', () => {
  render(<ThemeToggle />);
  const btn = screen.getByRole('button', { name: /테마/ });
  fireEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('theme')).toBe('dark');
  fireEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('theme')).toBe('light');
});
