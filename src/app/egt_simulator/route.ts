import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const html = await readFile(
    path.join(
      process.cwd(),
      "public",
      "standalone-pages",
      "gi_egt_simulator.html",
    ),
    "utf-8",
  );
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
