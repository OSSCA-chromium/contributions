import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import RootLayout from '@/app/layout';

const { renderToString }: typeof import('react-dom/server') = require('react-dom/server.node');

jest.mock('next/font/google', () => ({
  Roboto: () => ({ className: 'roboto' }),
  Outfit: () => ({ variable: 'outfit' }),
}));

test.each(['dark', 'light'])('저장된 %s 테마로 경고 없이 하이드레이션한다', async (theme) => {
  const originalHtml = document.documentElement.outerHTML;
  const layout = <RootLayout><p>콘텐츠</p></RootLayout>;
  let root: Root | undefined;
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

  try {
    localStorage.setItem('theme', theme);
    document.open();
    document.write(`<!DOCTYPE html>${renderToString(layout)}`);
    document.close();

    // Run the real pre-hydration theme bootstrap, as a browser would.
    const bootstrap = document.querySelector('head script');
    expect(bootstrap).not.toBeNull();
    window.eval(bootstrap!.textContent!);
    expect(document.documentElement.classList.contains('dark')).toBe(theme === 'dark');

    await act(async () => {
      root = hydrateRoot(document, layout);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(theme === 'dark');
    expect(document.querySelector('main')).toHaveTextContent('콘텐츠');
    expect(document.querySelector('button[aria-label="테마 전환"]')).toHaveTextContent(
      theme === 'dark' ? '🌙' : '☀️',
    );
    expect(errors).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root!.unmount());
    document.open();
    document.write(`<!DOCTYPE html>${originalHtml}`);
    document.close();
    localStorage.clear();
    errors.mockRestore();
  }
});
