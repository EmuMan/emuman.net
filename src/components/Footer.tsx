import Script from "next/script";

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

export default function Footer() {
  return (
    <>
      <Script
        src="https://code.iconify.design/iconify-icon/1.0.2/iconify-icon.min.js"
        strategy="lazyOnload"
      />
      <footer className="mt-8">
        <hr className="border-[var(--clr-neutral-400)]" />
        <div className="flex flex-row justify-center py-8">
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
        </div>
      </footer>
    </>
  );
}
