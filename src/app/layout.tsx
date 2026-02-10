import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EmuMan",
    template: "EmuMan - %s",
  },
  description:
    "Hello, EmuMan here. On this website, you can find out about all of the stuff I do, such as programming, writing music, and more!",
  openGraph: {
    title: "EmuMan's Website",
    description:
      "Hello, EmuMan here. On this website, you can find out about all of the stuff I do, such as programming, writing music, and more!",
    url: "https://emuman.net",
    siteName: "EmuMan",
    images: [
      {
        url: "/images/emu.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
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
