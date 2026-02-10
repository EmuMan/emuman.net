import "../globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
      <Header />
      <div className="delay-reveal">
        <Navigation />
        <div className="mx-auto w-[min(85%,1250px)]">
          <main className="pb-8">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}
