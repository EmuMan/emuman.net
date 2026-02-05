import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about EmuMan - a Computer Science Masters student at Cal Poly with a passion for application development.",
};

export default function AboutPage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">About Me</h1>
      <br />
      <hr className="border-[var(--clr-neutral-400)]" />
      <br />

      <h2 className="text-2xl font-bold mb-4">Who am I?</h2>
      <p className="mb-6">
        I am currently getting my Masters in Computer Science at California
        Polytechnic State University. Application development is my passion,
        whether it be games, websites, or simple tools. I have many other
        hobbies as well, from writing music to 3D design. I&apos;m also the
        current president of Cal Poly Game Development Club!
      </p>

      <h2 className="text-2xl font-bold mb-4">Resume and Portfolio</h2>
      <p className="mb-4">
        I am currently looking for work! If you want to learn about me in a more
        professional context,{" "}
        <strong>
          you can{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_BLOB_URL || ""}/files/jacob_kelleran_general_resume.pdf`}
            target="_blank"
            className="underline hover:text-[var(--clr-neutral-500)] transition-colors duration-200"
          >
            download my general resume here
          </a>
        </strong>
        .
      </p>
      <p className="mb-6">
        On top of that, the <strong>Programming</strong> and{" "}
        <strong>Games</strong> tabs on this website will give you a more
        complete and comprehensive view of all of the projects I&apos;ve worked
        on. If you have any questions please don&apos;t hesitate to reach out!
      </p>

      <h2 className="text-2xl font-bold mb-4">How can I contact you?</h2>
      <p className="mb-6">
        The best ways to contact me are through Discord (emuman) or by email (
        <a
          href="mailto:jacob.kelleran@outlook.com"
          className="underline hover:text-[var(--clr-neutral-500)] transition-colors duration-200"
        >
          jacob.kelleran@outlook.com
        </a>
        ).
      </p>

      <h2 className="text-2xl font-bold mb-4">Where else can I find you?</h2>
      <p>All of my socials are displayed as links down below!</p>
    </div>
  );
}
