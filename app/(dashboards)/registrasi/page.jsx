'use client';

import { useState } from 'react';
import Registrasi from '../../../src/dashboards/Registrasi';

export default function RegistrasiPage() {
  const [restartToken, setRestartToken] = useState(0);

  return (
    <Registrasi
      restartKey={restartToken}
      onRestart={() => setRestartToken((currentToken) => currentToken + 1)}
    />
  );
}
