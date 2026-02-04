import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: "Songtober 2020",
  description:
    "Songtober is a music challenge based off of the popular drawing event Inktober.",
};

export default async function Songtober2020Page() {
  const songs = await prisma.song.findMany({
    where: { collection: "songtober_2020" },
    orderBy: { index: "asc" },
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Songtober 2020</h1>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />

      <h2 className="text-2xl font-bold mb-4">What is Songtober?</h2>
      <p className="mb-4">
        Songtober is a sort of challenge based off of the popular informal
        drawing event, Inktober. In the case of Inktober, for every day of
        October, there is a new prompt that should be drawn by whoever is
        participating. You can read more about it{" "}
        <a
          href="https://inktober.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-link"
        >
          here
        </a>
        . When one of my friends shared the 2020 prompt list, since I can&apos;t
        draw, I had the idea to do the challenge but with music instead of
        drawing. And thus Songtober was born.
      </p>
      <p className="mb-4">
        Just as a side note, I am sure I am not the first to come up with this
        idea, but I have also never really seen anyone else do it, so for me
        it&apos;s a new concept. Enjoy my musical interpretations of these
        prompts.
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
        musicPath={`${process.env.NEXT_PUBLIC_BLOB_URL || ""}/music/songtober_2020/`}
      />
    </div>
  );
}
