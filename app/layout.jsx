import '../src/styles/globals.css';
import DevToolsHider from '../src/components/DevToolsHider';

// Disable SSR for this app since it uses client-side libraries and state
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Map Dashboard Web',
  description: 'Dashboard halaman peta dan statistik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <DevToolsHider />
      </body>
    </html>
  );
}
