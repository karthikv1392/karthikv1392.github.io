import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.argv[2];
const outputDirectory = process.argv[3] ?? "src/news";

if (!sourceDirectory) {
  console.error("Usage: node scripts/migrate-news.js <_news-directory> [output-directory]");
  process.exit(1);
}

function parseSource(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;

  const metadata = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return { metadata, content: match[2].trim() };
}

await mkdir(outputDirectory, { recursive: true });
const files = (await readdir(sourceDirectory)).filter((file) => file.endsWith(".md"));
let migratedCount = 0;

for (const file of files) {
  const parsed = parseSource(await readFile(path.join(sourceDirectory, file), "utf8"));
  if (!parsed?.metadata.title || !parsed.metadata.date) continue;

  const slug = path.basename(file, ".md");
  const normalizedDate = parsed.metadata.date.slice(0, 10);
  const migratedContent = parsed.content.replace(
    "/assets/img/cecam_group.jpeg",
    "/assets/images/cecam-group.webp"
  );
  const output = [
    "---",
    "layout: layouts/post.njk",
    `title: ${JSON.stringify(parsed.metadata.title)}`,
    `date: ${JSON.stringify(normalizedDate)}`,
    "tags: news",
    `permalink: /news/${slug}/`,
    "---",
    "",
    migratedContent,
    ""
  ].join("\n");

  await writeFile(path.join(outputDirectory, file), output);
  migratedCount += 1;
}

console.log(`Migrated ${migratedCount} news posts.`);
