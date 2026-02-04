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
    <div>
      <h1 className="text-4xl font-bold mb-4">My Art</h1>
      <p className="text-lg">
        I&apos;m no artist, but here&apos;s some stuff I&apos;ve created anyways
        if you&apos;d like to have a look around.
      </p>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      <div>
        {artworks.map((art) => {
          const imageSrc = art.imageUrl || `/art/${art.file}`;
          return (
            <div key={art.id} className="gallery-responsive">
              <div className="gallery-entry">
                <a href={imageSrc} target="_blank">
                  <Image
                    src={imageSrc}
                    alt={art.description}
                    width={400}
                    height={300}
                    className="gallery-img"
                  />
                </a>
                <div className="gallery-desc">
                  <p>{art.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="clearfix" />
      </div>
    </div>
  );
}
