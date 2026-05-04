
import { useState } from 'react';
import Geospatial from './pages/Geospatial';

function App() {
  const [restartToken, setRestartToken] = useState(0);

  const handleRestartPage = () => {
    setRestartToken((currentToken) => currentToken + 1);
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      <Geospatial restartKey={restartToken} onRestart={handleRestartPage} />
    </div>
  );
}

export default App;