import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Little Taste of Okinawa | Kawakami Foods Survey",
  description: "Share your thoughts on Okinawan food and receive Kawakami Foods sticker images for your everyday chats.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
