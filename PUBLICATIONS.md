# Updating publications

`src/bibliography/publications.bib` is the authoritative publication source.

## Normal workflow

1. Export the latest BibTeX from DBLP, Zotero, or another reference manager.
2. Replace `src/bibliography/publications.bib` with that file.
3. Preserve `selected = {true},` on entries that should appear in the featured publication section.
4. Run `npm run publications:sync`.

The command regenerates `src/_data/publications.json`, sorts entries by year, and uses a DOI or URL for the publication link. Featured entries remain chronological within the separate featured section.

The migration automatically collapses duplicate records for the same work. When both a repository version (such as CoRR, arXiv, or Zenodo) and a final publication exist, the final published record is retained. A `selected = {true}` flag on any duplicate is carried over to the retained record.

Both `npm run dev` and `npm run build` synchronize the bibliography automatically before Eleventy starts.
