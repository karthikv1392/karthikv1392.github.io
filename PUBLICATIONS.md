# Updating publications

`src/bibliography/publications.bib` is the authoritative publication source.

## Normal workflow

1. Export the latest BibTeX from DBLP, Zotero, or another reference manager.
2. Replace `src/bibliography/publications.bib` with that file.
3. Preserve `selected = {true},` on entries that should appear in the featured publication section.
4. Run `npm run publications:sync`.

The command regenerates `src/_data/publications.json`, sorts entries by year, and uses a DOI or URL for the publication link. Featured entries remain chronological within the separate featured section.

Both `npm run dev` and `npm run build` synchronize the bibliography automatically before Eleventy starts.
