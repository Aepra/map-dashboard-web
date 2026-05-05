'use client';

import { useState } from 'react';
import SeragamGratis from '../../../src/dashboards/SeragamGratis';

export default function SeragamGratisPage() {
  const [restartToken, setRestartToken] = useState(0);

  return (
    <SeragamGratis
      restartKey={restartToken}
      onRestart={() => setRestartToken((currentToken) => currentToken + 1)}
    />
  );
}
