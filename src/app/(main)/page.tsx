import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
      <p className="text-2xl">
        My name is <b>Jacob Kelleran</b>, and this is my website!
      </p>
      <br />
      <p className="text-xl">
        Here, you will can find various content related to me, including
        different projects, applications, and art. Feel free to dig around, or{" "}
        <Link
          href="/about"
          className="underline hover:text-neutral-600 transition-colors duration-200"
        >
          learn more about me here
        </Link>
        !
      </p>
    </div>
  );
}
