'use client';

import { useState } from 'react';
import BerkebutuhanKhusus from '../../../src/dashboards/BerkebutuhanKhusus';

export default function BerkebutuhanKhususPage() {
  const [restartToken, setRestartToken] = useState(0);

  return (
    <BerkebutuhanKhusus
      restartKey={restartToken}
      onRestart={() => setRestartToken((currentToken) => currentToken + 1)}
    />
  );
}
