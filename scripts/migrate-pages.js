import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = process.argv[2];

if (!sourceRoot) {
  console.error("Usage: node scripts/migrate-pages.js <current-site-root>");
  process.exit(1);
}

const pageMappings = [
  {
    source: "_pages/research.md",
    output: "src/research.md",
    title: "Research",
    description: "Research directions in AI for software architecture, architecture for AI systems, self-adaptation, IoT, and sustainable software."
  },
  {
    source: "_pages/teaching.md",
    output: "src/teaching.md",
    title: "Teaching",
    description: "Courses, lectures, projects, and teaching experience across software engineering and architecture."
  },
  {
    source: "_pages/students.md",
    output: "src/students.md",
    title: "Students",
    description: "Current and former research students, thesis students, staff, and interns."
  },
  {
    source: "_pages/activities.md",
    output: "src/activities.md",
    title: "Service & Activities",
    description: "Conference organization, program committees, reviewing, and community service."
  },
  {
    source: "_pages/talks.md",
    output: "src/talks.md",
    title: "Talks Archive",
    description: "An archive of invited talks, tutorials, panels, keynotes, and lectures."
  }
];

function stripFrontMatter(source) {
  return source.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
}

for (const page of pageMappings) {
  const source = await readFile(path.join(sourceRoot, page.source), "utf8");
  const content = stripFrontMatter(source)
    .replace(
      "![My Research Overview](/assets/img/SA_AI.png)",
      "![Overview of the relationship between software architecture and artificial intelligence](/assets/images/research-overview.webp)"
    )
    .replace(/\bSoftwares\b/g, "Software systems")
    .replace(/\bvaccancies\b/g, "vacancies");
  const frontMatter = [
    "---",
    "layout: layouts/academic-detail.njk",
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    `permalink: /${path.basename(page.output, ".md")}/`,
    "---",
    ""
  ].join("\n");

  await writeFile(page.output, `${frontMatter}${content}`);
}

console.log(`Migrated ${pageMappings.length} detailed pages.`);
