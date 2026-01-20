import './globals.css';
import { UserProvider } from '@/context/UserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased">
        <UserProvider>
          <div className="min-h-screen w-full flex flex-col">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
