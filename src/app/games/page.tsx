import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProjectEntry from "@/components/ProjectEntry";

export const metadata: Metadata = {
  title: "Games",
  description:
    "A collection of games that I have worked on, both solo projects and collaborations, for game jams, school, or just personal experiments.",
};

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Games</h1>
      <p className="text-lg">
        A collection of games that I have worked on, both solo projects and
        collaborations, for game jams, school, or just personal experiments.
      </p>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      {games.map((game, index) => (
        <div key={game.id}>
          <ProjectEntry
            name={game.name}
            descriptions={game.descriptions}
            image={game.image}
            imageUrl={game.imageUrl}
            technologies={game.technologies}
            link={game.link}
            reverse={index % 2 === 1}
          />
          <br />
        </div>
      ))}
    </div>
  );
}
