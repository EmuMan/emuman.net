import type { Metadata } from "next";
import "./corn.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "corn",
  description: "hello corn! The official site for the famous corn Discord bot!",
  openGraph: {
    title: "corn",
    description:
      "hello corn! The official site for the famous corn Discord bot!",
    url: "https://emuman.net/corn",
    images: [
      {
        url: "/icons/corn.png",
        width: 512,
        height: 512,
      },
    ],
    type: "website",
  },
};

const socialLinks = [
  { href: "https://github.com/EmuMan", icon: "mdi:github", label: "GitHub" },
  {
    href: "https://discord.gg/avRCpqX",
    icon: "ic:baseline-discord",
    label: "Discord",
  },
  {
    href: "https://www.youtube.com/@EmuManMusic",
    icon: "mdi:youtube",
    label: "YouTube",
  },
  {
    href: "https://www.twitch.tv/EmuManTV",
    icon: "mdi:twitch",
    label: "Twitch",
  },
  {
    href: "https://soundcloud.com/emuman-809930856",
    icon: "ri:soundcloud-fill",
    label: "SoundCloud",
  },
];

export default function CornLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        src="https://code.iconify.design/iconify-icon/1.0.2/iconify-icon.min.js"
        strategy="lazyOnload"
      />
      <div className="corn-background" />
      {children}
      <div className="delay-reveal">
        <div className="mx-auto w-[min(85%,1250px)]">
          <hr className="border-neutral-800 my-4 border-2" />
          <footer className="flex flex-row justify-center py-8">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center px-2 text-5xl hover:opacity-70 transition-opacity"
                aria-label={link.label}
                dangerouslySetInnerHTML={{
                  __html: `<iconify-icon icon="${link.icon}"></iconify-icon>`,
                }}
              />
            ))}
          </footer>
        </div>
      </div>
    </>
  );
}
