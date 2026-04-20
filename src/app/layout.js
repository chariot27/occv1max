import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "One-Click CV | LinkedIn to Resume in Seconds",
  description: "Generate professional, ATS-compatible resumes directly from your LinkedIn profile. Modern templates, international translation, and one-click export.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
