export const metadata = {
  title: '🍜 Vietnamese Dish Bucket List',
  description: 'Track 100 Vietnamese dishes on your trip',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Viet Dishes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0e0e0e" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script src="/register-sw.js" defer></script>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0e0e0e',
        color: '#f5f0e8',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  );
}
