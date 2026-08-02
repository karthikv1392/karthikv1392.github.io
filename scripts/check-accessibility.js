import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("_site");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : target;
    })
  );
  return nestedFiles.flat();
}

const htmlFiles = (await listFiles(outputDirectory)).filter(
  (file) => path.extname(file).toLowerCase() === ".html"
);
const issues = [];

for (const file of htmlFiles) {
  const markup = await readFile(file, "utf8");
  const relativePath = path.relative(outputDirectory, file);
  const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const imagesWithoutAlt = [...markup.matchAll(/<img\b[^>]*>/gi)]
    .filter((match) => !/\balt=["'][^"']*["']/i.test(match[0]));
  const headingCount = [...markup.matchAll(/<h1\b/gi)].length;

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(markup)) issues.push(`${relativePath}: missing html language`);
  if (!/<title>[^<]+<\/title>/i.test(markup)) issues.push(`${relativePath}: missing page title`);
  if (!/<main\b[^>]*\bid=["']main-content["']/i.test(markup)) issues.push(`${relativePath}: missing main landmark`);
  if (headingCount !== 1) issues.push(`${relativePath}: expected one h1, found ${headingCount}`);
  if (imagesWithoutAlt.length) issues.push(`${relativePath}: ${imagesWithoutAlt.length} image(s) missing alt`);
  if (duplicateIds.length) issues.push(`${relativePath}: duplicate id(s) ${duplicateIds.join(", ")}`);
}

if (issues.length) {
  console.error(`FAIL Static accessibility audit:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`PASS Static accessibility checks across ${htmlFiles.length} HTML pages.`);
}
