import { cp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = path.resolve("_site");
const outputDirectory = path.resolve("_site-university");
const pathPrefix = process.env.UNIVERSITY_PATH_PREFIX || "/~kv";

function prefixUrl(value) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return `${pathPrefix}${value}`;
  }

  return value;
}

function rewriteHtml(html) {
  const rewrittenAttributes = html.replace(
    /\b(href|src|action|poster)=(["'])(\/[^"']*)\2/g,
    (_match, attribute, quote, value) => `${attribute}=${quote}${prefixUrl(value)}${quote}`,
  );

  return rewrittenAttributes.replace(
    /\bsrcset=(["'])(.*?)\1/g,
    (_match, quote, value) => {
      const candidates = value
        .split(",")
        .map((candidate) => candidate.trim())
        .filter(Boolean)
        .map((candidate) => {
          const [url, descriptor] = candidate.split(/\s+/, 2);
          return descriptor ? `${prefixUrl(url)} ${descriptor}` : prefixUrl(url);
        });

      return `srcset=${quote}${candidates.join(", ")}${quote}`;
    },
  );
}

async function rewriteHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await rewriteHtmlFiles(entryPath);
        return;
      }

      if (entry.isFile() && entry.name.endsWith(".html")) {
        const html = await readFile(entryPath, "utf8");
        await writeFile(entryPath, rewriteHtml(html), "utf8");
      }
    }),
  );
}

await rm(outputDirectory, { recursive: true, force: true });
await cp(sourceDirectory, outputDirectory, { recursive: true });
await rewriteHtmlFiles(outputDirectory);
await unlink(path.join(outputDirectory, "CNAME")).catch((error) => {
  if (error.code !== "ENOENT") {
    throw error;
  }
});

console.log(`Prepared university site in ${outputDirectory} with prefix ${pathPrefix}`);
