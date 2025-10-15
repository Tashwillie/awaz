import '@/lib/init';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funnder',
  description: 'AI-powered voice assistant platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

