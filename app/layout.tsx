import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDX Sentinel AI',
  description: 'Institutional-grade AI financial intelligence terminal for the Indonesia Stock Exchange.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
