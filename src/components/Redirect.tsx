'use client';

import { useEffect } from 'react';

export default function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return (
    <p className="text-on-surface-variant">
      페이지가 이동되었습니다. 자동으로 이동하지 않으면{' '}
      <a className="text-primary underline" href={to}>
        여기를 클릭
      </a>
      하세요.
    </p>
  );
}
