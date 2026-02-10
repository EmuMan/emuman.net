import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Art",
  description:
    "I'm no artist, but here's some stuff I've created anyways if you'd like to have a look around.",
};

export default async function ArtPage() {
  const artworks = await prisma.art.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">My Art</h1>
      <p className="text-lg">
        I&apos;m no artist, but here&apos;s some stuff I&apos;ve created anyways
        if you&apos;d like to have a look around.
      </p>
      <br />
      <hr className="border-neutral-400" />
      <br />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((art) => {
          const imageSrc = art.imageUrl || `/art/${art.file}`;
          return (
            <a
              key={art.id}
              href={imageSrc}
              target="_blank"
              className="group relative overflow-hidden rounded-lg"
            >
              <Image
                src={imageSrc}
                alt={art.description}
                width={400}
                height={300}
                className="w-full h-auto rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p>{art.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
