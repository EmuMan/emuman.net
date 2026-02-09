import { Metadata } from "next";
import CBRendersClient from "./CBRendersClient";

export const metadata: Metadata = {
  title: "CB Renders",
  description: "Creeper Booty SMP Isometric Renders",
};

interface Props {
  searchParams: Promise<{ season?: string }>;
}

export default async function CBRendersPage({ searchParams }: Props) {
  const params = await searchParams;
  const season = params.season === "6" ? "6" : "1";

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">
        Creeper Booty SMP Isometric Renders
      </h1>
      <CBRendersClient initialSeason={season} />
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      <div className="w-full h-[600px]">
        <iframe
          src={`/cbrenders/s${season}/index.html`}
          className="w-full h-full border-0"
          title="CB Render"
        />
      </div>
    </div>
  );
}
