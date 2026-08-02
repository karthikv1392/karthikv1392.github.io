import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? "src/_data/publications.json";

if (!inputPath) {
  console.error("Usage: node scripts/migrate-bibliography.js <papers.bib> [output.json]");
  process.exit(1);
}

function extractEntries(source) {
  const entries = [];
  const entryPattern = /@(article|inproceedings|proceedings|book|incollection|misc|phdthesis|mastersthesis)\s*\{/gi;
  let match;

  while ((match = entryPattern.exec(source))) {
    let depth = 1;
    let cursor = entryPattern.lastIndex;

    while (cursor < source.length && depth > 0) {
      if (source[cursor] === "{") depth += 1;
      if (source[cursor] === "}") depth -= 1;
      cursor += 1;
    }

    entries.push({ type: match[1].toLowerCase(), body: source.slice(entryPattern.lastIndex, cursor - 1) });
    entryPattern.lastIndex = cursor;
  }

  return entries;
}

function parseFields(body) {
  const commaIndex = body.indexOf(",");
  const key = body.slice(0, commaIndex).trim();
  const fields = {};
  let cursor = commaIndex + 1;

  while (cursor < body.length) {
    while (/[\s,]/.test(body[cursor] ?? "")) cursor += 1;
    const nameStart = cursor;
    while (/[\w-]/.test(body[cursor] ?? "")) cursor += 1;
    const name = body.slice(nameStart, cursor).toLowerCase();

    while (/\s/.test(body[cursor] ?? "")) cursor += 1;
    if (!name || body[cursor] !== "=") {
      cursor += 1;
      continue;
    }

    cursor += 1;
    while (/\s/.test(body[cursor] ?? "")) cursor += 1;

    let value = "";
    if (body[cursor] === "{") {
      let depth = 1;
      const valueStart = ++cursor;
      while (cursor < body.length && depth > 0) {
        if (body[cursor] === "{") depth += 1;
        if (body[cursor] === "}") depth -= 1;
        cursor += 1;
      }
      value = body.slice(valueStart, cursor - 1);
    } else if (body[cursor] === '"') {
      const valueStart = ++cursor;
      while (cursor < body.length && body[cursor] !== '"') cursor += 1;
      value = body.slice(valueStart, cursor);
      cursor += 1;
    } else {
      const valueStart = cursor;
      while (cursor < body.length && body[cursor] !== ",") cursor += 1;
      value = body.slice(valueStart, cursor);
    }

    fields[name] = value.trim();
  }

  return { key, fields };
}

function cleanText(value = "") {
  const accentCharacters = {
    "`": { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" },
    "'": { a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", Y: "Ý" },
    "^": { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" },
    "\"": { a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", y: "ÿ", A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü" },
    "~": { a: "ã", n: "ñ", o: "õ", A: "Ã", N: "Ñ", O: "Õ" },
    "=": { a: "ā", e: "ē", i: "ī", o: "ō", u: "ū", A: "Ā", E: "Ē", I: "Ī", O: "Ō", U: "Ū" }
  };

  return value
    .replace(/\\\(\s*\\mathscr\{([A-Za-z])\}\s*\\\)/g, "$1")
    .replace(/\\([`'\^"~=])\{\\?([A-Za-z])\}/g, (_, accent, letter) =>
      accentCharacters[accent]?.[letter === "i" ? "i" : letter] ?? letter
    )
    .replace(/\\c\{([cC])\}/g, (_, letter) => (letter === "C" ? "Ç" : "ç"))
    .replace(/\\(ss|ae|AE|oe|OE|o|O|aa|AA|l|L)\b/g, (_, command) =>
      ({ ss: "ß", ae: "æ", AE: "Æ", oe: "œ", OE: "Œ", o: "ø", O: "Ø", aa: "å", AA: "Å", l: "ł", L: "Ł" })[command]
    )
    .replace(/\{\\&\}/g, "&")
    .replace(/\\&/g, "&")
    .replace(/[{}]/g, "")
    .replace(/~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanAuthors(value = "") {
  return value
    .split(/\s+and\s+/i)
    .map((author) => {
      const cleaned = cleanText(author);
      if (!cleaned.includes(",")) return cleaned;
      const [family, given] = cleaned.split(",").map((part) => part.trim());
      return `${given} ${family}`.trim();
    })
    .join(", ");
}

const source = await readFile(path.resolve(inputPath), "utf8");
const publications = extractEntries(source)
  .map(({ type, body }) => {
    const { key, fields } = parseFields(body);
    const doi = cleanText(fields.doi);
    const directUrl = cleanText(fields.url);

    return {
      key,
      type,
      year: cleanText(fields.year),
      title: cleanText(fields.title),
      authors: cleanAuthors(fields.author),
      venue: cleanText(fields.journal || fields.booktitle || fields.publisher || ""),
      url: directUrl || (doi ? `https://doi.org/${doi}` : ""),
      selected: cleanText(fields.selected).toLowerCase() === "true"
    };
  })
  .filter((publication) => publication.title && publication.year)
  .sort((left, right) => {
    const yearDifference = Number(right.year) - Number(left.year);
    return yearDifference || left.title.localeCompare(right.title);
  });

await writeFile(path.resolve(outputPath), `${JSON.stringify(publications, null, 2)}\n`);
console.log(`Migrated ${publications.length} publications to ${outputPath}`);
