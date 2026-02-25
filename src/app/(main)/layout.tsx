import "../globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RotatingImage from "@/components/RotatingImage";

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
      {/* Galaxy + header section */}
      <div className="relative h-[60vh] flex flex-col">
        <RotatingImage src="/images/starfield.png" />
        <RotatingImage src="/images/milkyway_bright.png" opacity={0.5} />
        <Header />
        {/* Gradient fade from transparent to background */}
        <div
          className="h-32 mt-auto"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-100) 0%, var(--color-accent-0) 100%)",
            backgroundAttachment: "fixed",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.03) 10%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.22) 37%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.65) 63%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0.96) 90%, rgba(0,0,0,1) 100%)",
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
