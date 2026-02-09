import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
      <body className="antialiased">
        {/* Background gradient */}
        <div
          className="fixed top-0 left-0 w-full h-full -z-10"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-100) 0%, var(--color-accent-0) 100%)",
          }}
        />
        <Header />
        <div className="delay-reveal">
          <Navigation />
          <div className="mx-auto w-[min(85%,1250px)]">
            <main className="pb-8">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
