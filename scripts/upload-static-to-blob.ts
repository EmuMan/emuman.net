import "dotenv/config";
import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

async function uploadFile(
  filePath: string,
  blobPath: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = await put(blobPath, fileBuffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log(`Uploaded: ${blobPath} -> ${blob.url}`);
  return blob.url;
}

async function uploadDirectory(localDir: string, blobPrefix: string): Promise<void> {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const blobPath = `${blobPrefix}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadDirectory(localPath, blobPath);
    } else if (entry.isFile()) {
      await uploadFile(localPath, blobPath);
    }
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN environment variable is not set.");
    process.exit(1);
  }

  console.log("Starting static files migration to Vercel Blob...\n");

  // Upload files folder
  const filesDir = path.join(PUBLIC_DIR, "files");
  if (fs.existsSync(filesDir)) {
    console.log("--- Uploading Files ---");
    await uploadDirectory(filesDir, "files");
  }

  // Upload music folder
  const musicDir = path.join(PUBLIC_DIR, "music");
  if (fs.existsSync(musicDir)) {
    console.log("\n--- Uploading Music ---");
    await uploadDirectory(musicDir, "music");
  }

  console.log("\n✓ Static files migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
