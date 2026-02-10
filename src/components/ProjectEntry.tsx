import Image from "next/image";

interface ProjectEntryProps {
  name: string;
  descriptions: string[];
  image: string;
  imageUrl?: string | null;
  technologies?: string;
  link?: string;
  reverse?: boolean;
}

export default function ProjectEntry({
  name,
  descriptions,
  image,
  imageUrl,
  technologies,
  link,
  reverse = false,
}: ProjectEntryProps) {
  const imageSrc = imageUrl || `/images/${image}`;
  return (
    <div
      className={`flex items-center max-md:flex-col ${reverse ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="p-6 md:p-12">
        <h2 className="font-accent font-bold text-2xl">{name}</h2>
        {technologies && (
          <p className=" mt-1italic text-neutral-700">{technologies}</p>
        )}
        {descriptions.map((description, index) => (
          <p
            key={index}
            className="mt-4 mb-2 description-text"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ))}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors duration-200 hover:text-neutral-500"
          >
            Click here to play {name}!
          </a>
        )}
      </div>
      <div className="shrink-0 overflow-hidden p-6 md:p-12 max-md:w-88 w-md">
        <Image
          src={imageSrc}
          alt={name}
          width={448}
          height={448}
          className="w-full h-auto object-cover rounded-xl transition-transform duration-300 ease-in-out hover:scale-110"
          unoptimized={image.endsWith(".gif")}
        />
      </div>
    </div>
  );
}
