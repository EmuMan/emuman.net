import { prisma } from "@/lib/prisma";
import Image from "next/image";
import CornAddButton from "./CornAddButton";

export default async function CornPage() {
  const features = await prisma.cornFeature.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <header className="pt-20 pb-6 text-center">
        <Image
          src="/icons/corn.png"
          alt="corn"
          width={150}
          height={150}
          className="rounded-full mx-auto mb-12"
        />
        <div className="typed-container mx-auto">
          <p className="corn-typed">hello corn</p>
        </div>
      </header>

      <div className="delay-reveal">
        <div className="mx-auto w-[min(85%,1250px)]">
          <div className="content text-center">
            <h1 className="text-4xl font-bold mb-4">What is corn?</h1>
            <p className="text-2xl mb-4">
              One of my primary passion projects, corn is a leaderboards-style
              Discord chat bot that I have been slowly adding to for the past
              few years. With monthly updates and events, corn is sure to liven
              up any server you add it to.
            </p>
            <CornAddButton />
            <br />
            <hr className="border-[var(--clr-neutral-400)]" />
            <br />

            <h1 className="text-4xl font-bold mb-8">Features</h1>

            {features.map((feature, index) => {
              const imageSrc = feature.imageUrl || `/images/${feature.image}`;
              return (
                <div
                  key={feature.id}
                  className={`flex items-center mb-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } max-md:flex-col`}
                >
                  <div className="flex-1 p-4">
                    <h2 className="text-2xl font-[var(--ff-accent)] mb-2">
                      {feature.name}
                    </h2>
                    {feature.descriptions.map((desc, i) => (
                      <p
                        key={i}
                        className="text-xl"
                        dangerouslySetInnerHTML={{ __html: desc }}
                      />
                    ))}
                  </div>
                  <div className="p-4">
                    <Image
                      src={imageSrc}
                      alt={feature.name}
                      width={368}
                      height={368}
                      className="rounded-2xl max-w-[min(23rem,80vw)]"
                    />
                  </div>
                </div>
              );
            })}

            <CornAddButton />
          </div>
        </div>
      </div>
    </>
  );
}
