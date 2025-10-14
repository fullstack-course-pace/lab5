import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "./providers/QueryProvider";

export const metadata: Metadata = {
  title: "Lab 5",
  description: "Public API Explorer",
  // If the remote had more fields (icons, viewport, etc.), re-add them here.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* If the remote layout had other providers (ThemeProvider, CssBaseline, etc.),
            keep them and place QueryProvider INSIDE the outermost provider. */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
