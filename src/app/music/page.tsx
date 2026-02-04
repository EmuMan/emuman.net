import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: "Music",
  description:
    "I write music sometimes, and before I started properly posting it online, I kept it here for display.",
};

export default async function MusicPage() {
  const songs = await prisma.song.findMany({
    where: { collection: "original" },
    orderBy: { index: "asc" },
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Original Music</h1>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      <p className="text-lg mb-4">
        I write music sometimes, and before I started properly posting it
        online, I kept it here for display. I&apos;ve since uploaded these
        tracks to Spotify, Soundcloud, and more, but I decided to keep them here
        because I was rather proud of the system I had set up. Also, I find
        value in having extra information presented below the song. It allows me
        to say things that I otherwise would not be able to in just a title.
      </p>
      <p className="mb-4">
        <strong>NOTE:</strong> Wearing headphones or using external speakers
        (not your phone or laptop&apos;s built-in speakers) will make your
        listening experience much better. I promise.
      </p>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      <MusicPlayer
        songs={songs}
        musicPath={`${process.env.NEXT_PUBLIC_BLOB_URL || ""}/music/originals/`}
      />
    </div>
  );
}
