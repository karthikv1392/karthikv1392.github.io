import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("_site");
const limits = {
  homepageBytes: 150 * 1024,
  cssBytes: 20 * 1024,
  javascriptBytes: 0,
  initialRequests: 8,
  carbonGramsPerView: 0.04
};
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

const files = await listFiles(outputDirectory);
const fileRecords = await Promise.all(
  files.map(async (file) => ({
    file,
    bytes: (await stat(file)).size,
    extension: path.extname(file).toLowerCase()
  }))
);

const totalFor = (extension) =>
  fileRecords
    .filter((record) => record.extension === extension)
    .reduce((total, record) => total + record.bytes, 0);

const homepage = fileRecords.find(
  (record) => path.relative(outputDirectory, record.file) === "index.html"
);
const cssBytes = totalFor(".css");
const javascriptBytes = totalFor(".js");
const homepageMarkup = homepage ? await readFile(homepage.file, "utf8") : "";
const homepageImagePaths = [...homepageMarkup.matchAll(/\/assets\/[^\s"',]+\.(?:webp|avif|jpe?g|png)/gi)].map(
  (match) => match[0]
);
const homepageImageBytes = fileRecords
  .filter((record) => homepageImagePaths.includes(`/${path.relative(outputDirectory, record.file)}`))
  .reduce((largest, record) => Math.max(largest, record.bytes), 0);
const homepageIconPaths = [...homepageMarkup.matchAll(/<link\b(?=[^>]*rel=["'][^"']*icon)(?=[^>]*href=["']([^"']+)["'])[^>]*>/gi)]
  .map((match) => match[1]);
const homepageIconFiles = fileRecords.filter((record) =>
  homepageIconPaths.includes(`/${path.relative(outputDirectory, record.file)}`)
);
const homepageIconBytes = homepageIconFiles.reduce((total, record) => total + record.bytes, 0);
const homepageBytes = (homepage?.bytes ?? 0) + cssBytes + javascriptBytes + homepageImageBytes + homepageIconBytes;
const initialRequests = 1 + (cssBytes > 0 ? 1 : 0) + (javascriptBytes > 0 ? 1 : 0) + (homepageImageBytes > 0 ? 1 : 0) + homepageIconFiles.length;
const carbonGramsPerView =
  (homepageBytes / swdm.bytesPerGigabyte) *
  swdm.energyKilowattHoursPerGigabyte *
  swdm.globalGridGramsPerKilowattHour;

const textFiles = fileRecords.filter((record) =>
  [".html", ".css"].includes(record.extension)
);
const loadedThirdParties = [];

for (const record of textFiles) {
  const content = await readFile(record.file, "utf8");
  const resourceMatches = content.matchAll(
    /(?:src|href)=["']https?:\/\/[^"']+["']|@import\s+(?:url\()?['"]?https?:\/\/[^)'"\s]+/gi
  );

  for (const match of resourceMatches) {
    if (/stylesheet|script|img|iframe|@import/i.test(match.input.slice(Math.max(0, match.index - 80), match.index + match[0].length))) {
      loadedThirdParties.push(match[0]);
    }
  }
}

const checks = [
  ["Homepage transfer", homepageBytes, limits.homepageBytes],
  ["CSS", cssBytes, limits.cssBytes],
  ["JavaScript", javascriptBytes, limits.javascriptBytes],
  ["Initial requests", initialRequests, limits.initialRequests],
  ["Third-party resources", loadedThirdParties.length, 0]
];

let failed = false;

for (const [label, actual, limit] of checks) {
  const passed = actual <= limit;
  failed ||= !passed;
  const unit = label === "Initial requests" || label === "Third-party resources" ? "" : " bytes";
  console.log(`${passed ? "PASS" : "FAIL"} ${label}: ${actual}${unit} (limit ${limit}${unit})`);
}

const carbonPassed = carbonGramsPerView <= limits.carbonGramsPerView;
failed ||= !carbonPassed;
console.log(
  `${carbonPassed ? "PASS" : "FAIL"} Estimated carbon: ${carbonGramsPerView.toFixed(4)} gCO2e/view ` +
  `(SWDM v4 global-grid estimate; A+ threshold ${limits.carbonGramsPerView.toFixed(3)} g)`
);
console.log(
  `INFO Estimated carbon at 10,000 views: ${(carbonGramsPerView * 10000).toFixed(1)} gCO2e`
);

if (failed) {
  process.exitCode = 1;
}
