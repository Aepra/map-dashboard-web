"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

const Geospatial = dynamic(() => import('../../../src/dashboards/Geospatial'), {
  ssr: false,
  loading: () => null,
});

export default function GeospatialPage() {
  const [restartToken, setRestartToken] = useState(0);

  return (
    <Geospatial
      restartKey={restartToken}
      onRestart={() => setRestartToken((currentToken) => currentToken + 1)}
    />
  );
}
