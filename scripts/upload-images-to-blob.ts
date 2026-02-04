import "dotenv/config";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PUBLIC_DIR = path.join(process.cwd(), "public");

async function uploadFile(
  filePath: string,
  blobPath: string
): Promise<string | null> {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = await put(blobPath, fileBuffer, {
    access: "public",
  });

  console.log(`Uploaded: ${blobPath} -> ${blob.url}`);
  return blob.url;
}

async function migrateArtImages() {
  console.log("\n--- Migrating Art Images ---");
  const artworks = await prisma.art.findMany();

  for (const art of artworks) {
    const filePath = path.join(PUBLIC_DIR, "art", art.file);
    const blobPath = `art/${art.file}`;
    const url = await uploadFile(filePath, blobPath);

    if (url) {
      await prisma.art.update({
        where: { id: art.id },
        data: { imageUrl: url },
      });
    }
  }
}

async function migrateProgrammingImages() {
  console.log("\n--- Migrating Programming Project Images ---");
  const projects = await prisma.programmingProject.findMany();

  for (const project of projects) {
    const filePath = path.join(PUBLIC_DIR, "images", project.image);
    const blobPath = `images/${project.image}`;
    const url = await uploadFile(filePath, blobPath);

    if (url) {
      await prisma.programmingProject.update({
        where: { id: project.id },
        data: { imageUrl: url },
      });
    }
  }
}

async function migrateGameImages() {
  console.log("\n--- Migrating Game Images ---");
  const games = await prisma.game.findMany();

  for (const game of games) {
    const filePath = path.join(PUBLIC_DIR, "images", game.image);
    const blobPath = `images/${game.image}`;
    const url = await uploadFile(filePath, blobPath);

    if (url) {
      await prisma.game.update({
        where: { id: game.id },
        data: { imageUrl: url },
      });
    }
  }
}

async function migrateCornImages() {
  console.log("\n--- Migrating Corn Feature Images ---");
  const features = await prisma.cornFeature.findMany();

  for (const feature of features) {
    const filePath = path.join(PUBLIC_DIR, "images", feature.image);
    const blobPath = `images/${feature.image}`;
    const url = await uploadFile(filePath, blobPath);

    if (url) {
      await prisma.cornFeature.update({
        where: { id: feature.id },
        data: { imageUrl: url },
      });
    }
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN environment variable is not set.");
    console.error("Please add it to your .env file.");
    console.error("You can get this token from your Vercel project settings.");
    process.exit(1);
  }

  console.log("Starting image migration to Vercel Blob...\n");

  await migrateArtImages();
  await migrateProgrammingImages();
  await migrateGameImages();
  await migrateCornImages();

  console.log("\n✓ Image migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
