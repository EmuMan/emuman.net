import "../globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Galaxy from "@/components/Galaxy";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Background gradient */}
      <div
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-100) 0%, var(--color-accent-0) 100%)",
        }}
      />
      {/* Galaxy + header section — scrolls naturally with the page */}
      <div className="relative">
        <Galaxy />
        <Header />
        {/* Gradient fade from transparent to background */}
        <div
          className="h-32"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-100) 0%, var(--color-accent-0) 100%)",
            backgroundAttachment: "fixed",
            maskImage: "linear-gradient(to bottom, transparent, black)",
          }}
        />
      </div>
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-100) 0%, var(--color-accent-0) 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="delay-reveal">
          <Navigation />
          <div className="mx-auto w-[min(85%,1250px)]">
            <main className="pb-8">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
