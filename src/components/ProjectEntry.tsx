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
      className={`programming-entry ${reverse ? "flex-row-reverse" : "flex-row"}`}
    >
      <div>
        <h2 className="font-[var(--ff-accent)] text-2xl">{name}</h2>
        {technologies && (
          <p className="-mt-2 mb-4 italic text-[var(--clr-neutral-600)]">
            {technologies}
          </p>
        )}
        {descriptions.map((description, index) => (
          <p
            key={index}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ))}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            Click here to play {name}!
          </a>
        )}
      </div>
      <div className="programming-img flex-shrink-0">
        <Image
          src={imageSrc}
          alt={name}
          width={368}
          height={368}
          className="w-[23rem] h-auto rounded-[5%] object-cover transition-transform duration-300 ease-in-out hover:scale-110"
          unoptimized={image.endsWith(".gif")}
        />
      </div>
    </div>
  );
}
