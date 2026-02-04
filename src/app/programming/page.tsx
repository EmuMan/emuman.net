import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProjectEntry from "@/components/ProjectEntry";

export const metadata: Metadata = {
  title: "Programming",
  description:
    "A series of projects that I've worked on over the years, both for hobby and for school.",
};

export default async function ProgrammingPage() {
  const projects = await prisma.programmingProject.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Programming Projects</h1>
      <p className="text-lg">
        A series of projects that I&apos;ve worked on over the years, both for
        hobby and for school.
      </p>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />
      {projects.map((project, index) => (
        <div key={project.id}>
          <ProjectEntry
            name={project.name}
            descriptions={project.descriptions}
            image={project.image}
            imageUrl={project.imageUrl}
            reverse={index % 2 === 1}
          />
          <br />
        </div>
      ))}
    </div>
  );
}
