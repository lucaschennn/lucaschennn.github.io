import "./globals.css";

// Open to visitors, but not meant to be found by search engines.
export const metadata = { title: "skyview", robots: { index: false, follow: false } };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
