import './globals.css';

export const metadata = { title: 'Welcome ItzFizz', description: 'Scroll-driven hero animation' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
