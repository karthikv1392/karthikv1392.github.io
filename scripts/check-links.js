import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("_site");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : target;
    })
  );
  return nested.flat();
}

function resolveTarget(reference) {
  const cleanReference = reference.split("#")[0].split("?")[0];
  if (!cleanReference) return null;
  const relative = cleanReference.replace(/^\//, "");
  if (cleanReference.endsWith("/")) return path.join(outputDirectory, relative, "index.html");
  return path.join(outputDirectory, relative);
}

const htmlFiles = (await listFiles(outputDirectory)).filter((file) => file.endsWith(".html"));
const failures = [];

for (const htmlFile of htmlFiles) {
  const content = await readFile(htmlFile, "utf8");
  const references = [...content.matchAll(/(?:href|src)=["'](\/[^"']*)["']/g)].map((match) => match[1]);

  for (const reference of references) {
    const target = resolveTarget(reference);
    if (!target) continue;
    try {
      await access(target);
    } catch {
      failures.push(`${path.relative(outputDirectory, htmlFile)} -> ${reference}`);
    }
  }
}

if (failures.length) {
  console.error(`Found ${failures.length} broken internal references:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`PASS Internal links across ${htmlFiles.length} HTML pages.`);
}
