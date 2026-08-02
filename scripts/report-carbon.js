import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("_site");
const swdm = {
  bytesPerGigabyte: 1024 ** 3,
  energyKilowattHoursPerGigabyte: 0.3,
  globalGridGramsPerKilowattHour: 494
};

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

async function assetBytes(assetPath) {
  if (!assetPath.startsWith("/")) return 0;
  try {
    return (await stat(path.join(outputDirectory, assetPath))).size;
  } catch {
    return 0;
  }
}

function emissionsFor(bytes) {
  return (
    (bytes / swdm.bytesPerGigabyte) *
    swdm.energyKilowattHoursPerGigabyte *
    swdm.globalGridGramsPerKilowattHour
  );
}

function routeFor(file) {
  const relativePath = path.relative(outputDirectory, file);
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replace(/\/index\.html$/, "/")}`;
}

const htmlFiles = (await listFiles(outputDirectory)).filter(
  (file) => path.extname(file).toLowerCase() === ".html"
);
const pages = [];

for (const file of htmlFiles) {
  const markup = await readFile(file, "utf8");
  let bytes = (await stat(file)).size;

  const linkedAssets = [
    ...markup.matchAll(/<(?:link|script)\b[^>]*(?:href|src)=["'](\/assets\/[^"']+)["'][^>]*>/gi)
  ];
  for (const match of linkedAssets) bytes += await assetBytes(match[1]);

  const imageTags = [...markup.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  for (const imageTag of imageTags) {
    const srcset = imageTag.match(/srcset=["']([^"']+)["']/i)?.[1];
    if (srcset) {
      const candidates = srcset
        .split(",")
        .map((candidate) => candidate.trim().split(/\s+/)[0]);
      const candidateSizes = await Promise.all(candidates.map(assetBytes));
      bytes += Math.max(0, ...candidateSizes);
      continue;
    }

    const source = imageTag.match(/src=["']([^"']+)["']/i)?.[1];
    if (source) bytes += await assetBytes(source);
  }

  pages.push({ route: routeFor(file), bytes, grams: emissionsFor(bytes) });
}

pages.sort((left, right) => left.bytes - right.bytes);
const totalBytes = pages.reduce((sum, page) => sum + page.bytes, 0);
const averageBytes = totalBytes / pages.length;
const medianPage = pages[Math.floor(pages.length / 2)];
const heaviestPage = pages.at(-1);
const homepage = pages.find((page) => page.route === "/");

console.log("Carbon estimate — SWDM v4, global-grid defaults, uncached first loads");
console.log(`Pages audited: ${pages.length}`);
console.log(`Homepage: ${homepage.bytes} bytes, ${homepage.grams.toFixed(4)} gCO2e/view`);
console.log(`Site average: ${Math.round(averageBytes)} bytes, ${emissionsFor(averageBytes).toFixed(4)} gCO2e/view`);
console.log(`Median page: ${medianPage.bytes} bytes, ${medianPage.grams.toFixed(4)} gCO2e/view`);
console.log(`Heaviest page: ${heaviestPage.route} — ${heaviestPage.bytes} bytes, ${heaviestPage.grams.toFixed(4)} gCO2e/view`);
console.log(`10,000 average page views: ${(emissionsFor(averageBytes) * 10000).toFixed(1)} gCO2e`);
