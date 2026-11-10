[![Stand With Ukraine](./banner2-direct.svg)](https://stand-with-ukraine.pp.ua/)

# NeoNeoValues
An original political ideology test using a decision tree architecture to provide nuanced results based on your unique combination of political values.

## About this version
NeoNeoValues is a modified version of **NeoValues v3.0**, an original political ideology test. It is shared under the same license as the original, [CC BY-NC-SA 4.0](./LICENSE); see the LICENSE file for the full terms. The original work has been modified.

Changes in this version:
- the value icon and name shown next to every quiz answer, and each ideology's required values in the catalog
- a "Previous question" button and a way to redo a single category from the results page
- the top 5 closest ideologies with similarity scores, and a side-by-side Compare page
- "How to get this" answer paths on ideology and value pages
- search and filters on the Ideologies and Values pages, and the list of ideologies each value belongs to
- a light/dark theme that stays the same on every page
- export your results as a PNG image (your values on the left, your match and closest ideologies on the right)
- 14 easter egg ideologies (13 made up from existing values, plus the original's own Neo-Libertarian Falangism, now shown in the Easter Eggs group)
- a quiz progress bar, plus keyboard shortcuts (number keys answer, left arrow goes back)
- a short "copy link to my results" link, and link-preview tags for chat apps
- every value icon restyled in one consistent look (black disc, ring and symbol in the icon's own colour)
- an ideology builder (`builder.html`): pick any value in each category, see which ideology it makes, the closest alternatives and the exact quiz answers to get there, and share the build as a link
- a "similar ideologies" list on every ideology page, and an "Open in the builder" button
- works offline and can be installed as an app once it is published on https

## Files and how they fit together
- `icons/` holds the value icons restyled to match `anarchism.svg`: a near-black (`#1b1b1b`) disc, with the ring and symbol in the icon's own main colour (very dark colours are brightened a little so they stay readable). The untouched originals are in `tools/icons_original/`. To change an icon's colour, edit its `main` value in `tools/icon_style.json`, then run `python3 tools/restyle_icons.py` and `python3 tools/build.py`.
- `data.js`, `questions_tree.json` and `icons/` are the original NeoValues data. `data.js` is unchanged.
- `mods.js` holds everything added on top (the easter egg ideologies). To add one, add an entry to `EASTER_EGGS`.
- `questions_tree.js` is the same data as `questions_tree.json` as a script, so the quiz works when opened from disk.
- `icons_data.js` and the file list inside `sw.js` are **generated**. After changing icons or any site file, run:

      python3 tools/build.py

  If you skip this, everything still works, but new files will not be saved for offline use until they are visited.
  The script also adds a version (like `?v=5faafa8f`) to every script and stylesheet address in the pages, so a browser can never pair a new page with an old copy of a script.
- If a site file is missing or out of date, the quiz, the results page and a banner on every other page say which one.
- `check.html` is a file check: open it on the running site and it compares every file with the size and fingerprint it should have, and lists any that are missing, cut off, or an older version. `tools/build.py` fills in those fingerprints, so run it before publishing.

## Publishing notes (GitHub Pages)
- Offline mode and the "Install app" button only switch on for `https` sites (like GitHub Pages), so editing locally never shows stale copies.
- For link previews to show the picture on every chat app, replace `og-image.png` in the `og:image` and `twitter:image` tags of `index.html` and `results.html` with the full address, for example `https://YOUR-NAME.github.io/YOUR-REPO/og-image.png`.
- File names are case-sensitive on GitHub (for example `Instruction.html` with a capital I).
- Shared links contain your results inside the link itself. Nothing is stored on a server.
