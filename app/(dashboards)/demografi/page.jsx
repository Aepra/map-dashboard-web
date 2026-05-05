'use client';

import { useState } from 'react';
import Demografi from '../../../src/dashboards/Demografi';

export default function DemografiPage() {
  const [restartToken, setRestartToken] = useState(0);

  return (
    <Demografi
      restartKey={restartToken}
      onRestart={() => setRestartToken((currentToken) => currentToken + 1)}
    />
  );
}
