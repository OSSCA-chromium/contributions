'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useEffect, useState } from 'react';

const GA_ID = 'G-5T5Q4PMYKM';
// Only the production GitHub Pages host should report analytics;
// localhost and forked deployments must not pollute the data.
const PROD_HOSTNAME = 'ossca-chromium.github.io';

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.location.hostname === PROD_HOSTNAME);
  }, []);

  if (!enabled) return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
