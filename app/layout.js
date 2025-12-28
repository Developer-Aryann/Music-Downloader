import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Melodix | Premium Music Downloader",
  description: "Experience music like never before. High-quality streaming and downloads.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased bg-black text-white selection:bg-primary selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
