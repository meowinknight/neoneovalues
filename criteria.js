/* NeoNeoValues mod: shared helpers for showing value icons + names ("criteria chips").
   Requires data.js (resultsMapping, labelMapping, categories) to be loaded first. */

const NV_MAX_INLINE_CHIPS = 4;

function nvCategoryOf(valueId) {
    return Object.keys(resultsMapping).find(cat => resultsMapping[cat][valueId]) || null;
}

function nvValueName(cat, valueId) {
    return (resultsMapping[cat] && resultsMapping[cat][valueId]) || valueId.replace(/_/g, ' ');
}

/* Build one chip: small icon + readable name. `state` is optional: 'match' | 'miss'. */
function nvMakeChip(valueId, state, asLink) {
    const cat = nvCategoryOf(valueId);
    if (!cat) return null; // unknown id in data (skipped safely)
    const chip = document.createElement(asLink ? 'a' : 'span');
    if (asLink) chip.href = `description.html?id=${valueId}&cat=${cat}`;
    chip.className = 'nv-chip' + (state ? ' nv-' + state : '');
    chip.title = (categoryTitles[cat] || cat) + ': ' + nvValueName(cat, valueId);

    const img = document.createElement('img');
    img.src = `icons/${cat}/${valueId}.svg`;
    img.alt = '';
    img.onerror = () => { img.style.display = 'none'; };

    const label = document.createElement('span');
    label.textContent = nvValueName(cat, valueId);

    chip.appendChild(img);
    chip.appendChild(label);
    return chip;
}

/* Collect every result value reachable from a node id inside one category's question list. */
function nvReachableLeaves(nodesById, nodeId, seen) {
    seen = seen || new Set();
    if (seen.has(nodeId)) return [];
    seen.add(nodeId);
    const node = nodesById[nodeId];
    if (!node) return [];
    if (!node.options) return [node.id];
    let out = [];
    node.options.forEach(o => { out = out.concat(nvReachableLeaves(nodesById, o.next, seen)); });
    return Array.from(new Set(out));
}

/* Chips shown next to a quiz answer. One result -> a single chip.
   Several possible results -> first few chips plus an expandable "+N more". */
function nvMakeOutcomeBox(leafIds) {
    const box = document.createElement('div');
    box.className = 'nv-outcomes';
    const chips = leafIds.map(id => nvMakeChip(id)).filter(Boolean);
    if (chips.length === 0) return null;

    const head = document.createElement('div');
    head.className = 'nv-outcome-label';
    head.textContent = chips.length === 1 ? 'You get:' : 'Could lead to:';
    box.appendChild(head);

    const row = document.createElement('div');
    row.className = 'nv-chip-row';
    box.appendChild(row);

    chips.slice(0, NV_MAX_INLINE_CHIPS).forEach(c => row.appendChild(c));

    if (chips.length > NV_MAX_INLINE_CHIPS) {
        const extra = chips.slice(NV_MAX_INLINE_CHIPS);
        const more = document.createElement('span');
        more.className = 'nv-more';
        more.textContent = `+${extra.length} more`;
        more.setAttribute('role', 'button');
        more.tabIndex = 0;
        let open = false;
        const toggle = e => {
            e.stopPropagation(); // do not trigger the answer button
            e.preventDefault();
            open = !open;
            extra.forEach(c => { c.style.display = open ? '' : 'none'; });
            more.textContent = open ? 'show less' : `+${extra.length} more`;
        };
        more.addEventListener('click', toggle);
        more.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
        extra.forEach(c => { c.style.display = 'none'; row.appendChild(c); });
        row.appendChild(more);
    }
    return box;
}

/* All criteria "variants" of an ideology (some ideologies have several valid combinations). */
function nvIdeologyVariants(ideologyName) {
    return Object.keys(labelMapping)
        .filter(key => labelMapping[key] === ideologyName)
        .map(key => key.split('|'));
}

/* Criteria block for an ideology. `userValues` (optional array of the user's result ids)
   marks each criterion as matched / not matched. */
function nvMakeCriteriaBlock(ideologyName, userValues) {
    const variants = nvIdeologyVariants(ideologyName);
    const wrap = document.createElement('div');
    wrap.className = 'nv-criteria';
    if (variants.length === 0) return wrap;

    variants.forEach((parts, i) => {
        if (variants.length > 1) {
            const tag = document.createElement('div');
            tag.className = 'nv-variant-tag';
            tag.textContent = i === 0 ? `Variant 1 of ${variants.length}` : `Or variant ${i + 1}`;
            wrap.appendChild(tag);
        }
        const row = document.createElement('div');
        row.className = 'nv-chip-row';
        parts.forEach(id => {
            const state = userValues ? (userValues.includes(id) ? 'match' : 'miss') : null;
            const chip = nvMakeChip(id, state, true);
            if (chip) row.appendChild(chip);
        });
        wrap.appendChild(row);
    });
    return wrap;
}


/* Ideologies that use a given value, grouped by their catalog group. Returns [{group, names[]}]. */
function nvIdeologiesForValue(valueId) {
    const names = new Set();
    Object.keys(labelMapping).forEach(key => {
        if (key.split('|').includes(valueId)) names.add(labelMapping[key]);
    });
    const out = [];
    Object.keys(ideologyGroups).forEach(group => {
        const inGroup = ideologyGroups[group].filter(n => names.has(n));
        if (inGroup.length) out.push({ group, names: inGroup });
    });
    return out;
}


/* ======================================================================
   Shared logic for: results ranking, "how to get this", compare view
   ====================================================================== */

/* ---------- results in URLs: validation + a compact share format ---------- */

/* Keep only known categories and known value ids (results can arrive from a URL, so never trust them). */
function nvSanitizeResults(obj) {
    const clean = {};
    if (!obj || typeof obj !== 'object') return clean;
    categories.forEach(cat => {
        const v = obj[cat];
        if (typeof v === 'string' && resultsMapping[cat] && Object.prototype.hasOwnProperty.call(resultsMapping[cat], v)) {
            clean[cat] = v;
        }
    });
    return clean;
}

/* Compact form used for share links: the nine value ids in quiz order, comma separated. */
function nvEncodeResults(res) {
    return categories.map(cat => (res && res[cat]) || '').join(',');
}

function nvDecodeResults(str) {
    const obj = {};
    String(str || '').split(',').forEach((v, i) => { if (categories[i] && v) obj[categories[i]] = v; });
    return nvSanitizeResults(obj);
}

/* The user's quiz results: ?s= (shared link), then ?r= (internal links), then localStorage. */
function nvGetUserResults() {
    try {
        const params = new URLSearchParams(window.location.search);
        const s = params.get('s');
        if (s) return nvDecodeResults(s);
        const r = params.get('r');
        if (r) return nvSanitizeResults(JSON.parse(r));
    } catch (e) {}
    try { return nvSanitizeResults(JSON.parse(localStorage.getItem('quizResults') || '{}')); } catch (e) { return {}; }
}

function nvHasResults(res) { return !!res && Object.keys(res).length > 0; }

function nvAllIdeologies() {
    return Array.from(new Set(Object.values(labelMapping)));
}

function nvGroupOf(cat, valueId) {
    const subs = subCategories[cat] || {};
    return Object.keys(subs).find(g => subs[g].includes(valueId)) || null;
}

/* Variants of an ideology as {category: valueId} maps (unknown ids skipped). */
function nvVariantMaps(ideologyName) {
    return nvIdeologyVariants(ideologyName).map(parts => {
        const map = {};
        parts.forEach(id => { const c = nvCategoryOf(id); if (c) map[c] = id; });
        return map;
    });
}

/* How well does the user's result set fit an ideology? Uses its best variant.
   exact = same value, close = same sub-family (half credit), conflicts = incompatible families. */
function nvSimilarity(ideologyName, userRes) {
    let best = null;
    nvVariantMaps(ideologyName).forEach(map => {
        const cats = Object.keys(map);
        let exact = 0, close = 0, conflicts = 0;
        cats.forEach(cat => {
            const want = map[cat], have = userRes[cat];
            if (!have) return;
            if (have === want) { exact++; return; }
            const ug = nvGroupOf(cat, have), rg = nvGroupOf(cat, want);
            if (ug && ug === rg) { close++; return; }
            if (ug && rg) {
                const a = incompatibleSubCategories[ug] || [], b = incompatibleSubCategories[rg] || [];
                if (a.includes(rg) || b.includes(ug)) conflicts++;
            }
        });
        const total = cats.length;
        const cand = { name: ideologyName, exact, close, conflicts, total,
                       score: total ? (exact + 0.5 * close) / total : 0, map };
        if (!best || cand.score > best.score ||
            (cand.score === best.score && (cand.conflicts < best.conflicts ||
             (cand.conflicts === best.conflicts && cand.total > best.total)))) best = cand;
    });
    return best;
}

/* Top N closest ideologies (excluding `exclude` names). Conflicting ideologies are left out. */
function nvClosestIdeologies(userRes, n, exclude) {
    const skip = new Set(exclude || []);
    return nvAllIdeologies()
        .filter(name => !skip.has(name))
        .map(name => nvSimilarity(name, userRes))
        .filter(s => s && s.conflicts === 0 && s.score > 0)
        .sort((a, b) => b.score - a.score || b.total - a.total || a.name.localeCompare(b.name))
        .slice(0, n);
}

/* ---------- "How do I get this?" : the answer path through the quiz ---------- */

function nvAnswerPaths(valueId) {
    const tree = window.NV_QUESTIONS_TREE;
    const cat = nvCategoryOf(valueId);
    if (!tree || !cat || !tree[cat]) return [];
    const nodes = {};
    tree[cat].forEach(n => { nodes[n.id] = n; });
    const found = [];
    (function walk(id, steps, seen) {
        const node = nodes[id];
        if (!node || seen.has(id)) return;
        if (!node.options) { if (id === valueId) found.push(steps); return; }
        const nextSeen = new Set(seen); nextSeen.add(id);
        node.options.forEach(o => walk(o.next, steps.concat([{ q: node.text, a: o.text }]), nextSeen));
    })(tree[cat][0].id, [], new Set());
    return found;
}

function nvMakeStepList(steps) {
    const ol = document.createElement('ol');
    ol.className = 'nv-steps';
    steps.forEach(s => {
        const li = document.createElement('li');
        const q = document.createElement('div'); q.className = 'nv-step-q'; q.textContent = s.q;
        const a = document.createElement('div'); a.className = 'nv-step-a'; a.textContent = '\u2192 ' + s.a;
        li.appendChild(q); li.appendChild(a); ol.appendChild(li);
    });
    return ol;
}

/* Path block for a single value (used on value pages). */
function nvMakePathBlock(valueId) {
    const wrap = document.createElement('div');
    const paths = nvAnswerPaths(valueId);
    paths.forEach((steps, i) => {
        if (paths.length > 1) {
            const t = document.createElement('div'); t.className = 'nv-variant-tag';
            t.textContent = `Route ${i + 1}`; wrap.appendChild(t);
        }
        wrap.appendChild(nvMakeStepList(steps));
    });
    return wrap;
}

/* Path block for an ideology: one collapsible section per required value. */
function nvMakeIdeologyPathBlock(ideologyName) {
    const wrap = document.createElement('div');
    const order = categories || Object.keys(resultsMapping);
    const variants = nvIdeologyVariants(ideologyName);
    variants.forEach((parts, vi) => {
        if (variants.length > 1) {
            const t = document.createElement('div'); t.className = 'nv-variant-tag';
            t.textContent = `Variant ${vi + 1} of ${variants.length}`; wrap.appendChild(t);
        }
        parts.filter(id => nvCategoryOf(id))
             .sort((a, b) => order.indexOf(nvCategoryOf(a)) - order.indexOf(nvCategoryOf(b)))
             .forEach(id => {
                const det = document.createElement('details'); det.className = 'nv-path';
                const sum = document.createElement('summary');
                const chip = nvMakeChip(id); if (chip) sum.appendChild(chip);
                det.appendChild(sum);
                det.appendChild(nvMakePathBlock(id));
                wrap.appendChild(det);
            });
    });
    return wrap;
}

/* ---------- Compare view helpers ---------- */

/* Resolve a compare side ('you' or an ideology name) into variant maps. */
function nvSideVariants(spec, userRes) {
    if (spec === 'you') return nvHasResults(userRes) ? [Object.assign({}, userRes)] : [];
    return nvVariantMaps(spec);
}

/* Best pairing of variants for two sides: most shared values, then fewest differences. */
function nvCompareSides(specA, specB, userRes) {
    const va = nvSideVariants(specA, userRes), vb = nvSideVariants(specB, userRes);
    if (!va.length || !vb.length) return null;
    let best = null;
    va.forEach((ma, ia) => vb.forEach((mb, ib) => {
        let shared = 0, differ = 0, onlyOne = 0;
        const rows = (categories || Object.keys(resultsMapping)).map(cat => {
            const x = ma[cat] || null, y = mb[cat] || null;
            let status = 'none';
            if (x && y) { status = x === y ? 'shared' : 'differ'; }
            else if (x || y) status = 'one';
            if (status === 'shared') shared++; else if (status === 'differ') differ++; else if (status === 'one') onlyOne++;
            return { cat, a: x, b: y, status };
        });
        const cand = { rows, shared, differ, onlyOne, ia, ib, na: va.length, nb: vb.length };
        if (!best || cand.shared > best.shared || (cand.shared === best.shared && cand.differ < best.differ)) best = cand;
    }));
    return best;
}


/* ======================================================================
   Ideology builder + "similar ideologies"
   ====================================================================== */

/* The ideology a set of values produces. Same rule as the quiz results: the most specific ideology
   whose values are ALL included wins. `res` is {category: valueId}. Returns {name, key} or null. */
function nvMatchIdeology(res) {
    const values = Object.values(res || {});
    const key = Object.keys(labelMapping)
        .sort((a, b) => b.split('|').length - a.split('|').length)
        .find(k => k.split('|').every(part => values.includes(part)));
    return key ? { name: labelMapping[key], key } : null;
}

/* How alike are two ideologies (given as {category: valueId} maps)?
   Per category either of them defines: same value = 1, same family = 0.5, otherwise 0.
   conflicts counts categories whose families are incompatible. */
function nvIdeologyPairScore(mapA, mapB) {
    let sum = 0, universe = 0, exact = 0, close = 0, conflicts = 0;
    categories.forEach(cat => {
        const x = mapA[cat], y = mapB[cat];
        if (!x && !y) return;
        universe++;
        if (!x || !y) return;
        if (x === y) { sum += 1; exact++; return; }
        const gx = nvGroupOf(cat, x), gy = nvGroupOf(cat, y);
        if (gx && gx === gy) { sum += 0.5; close++; return; }
        if (gx && gy) {
            const a = incompatibleSubCategories[gx] || [], b = incompatibleSubCategories[gy] || [];
            if (a.includes(gy) || b.includes(gx)) conflicts++;
        }
    });
    return { score: universe ? sum / universe : 0, exact, close, conflicts, universe };
}

/* The n ideologies most like `name` (best variant of each), skipping ones that clash with it. */
function nvSimilarIdeologies(name, n) {
    const mine = nvVariantMaps(name);
    return nvAllIdeologies()
        .filter(other => other !== name)
        .map(other => {
            let best = null;
            nvVariantMaps(other).forEach(mb => mine.forEach(ma => {
                const s = nvIdeologyPairScore(ma, mb);
                if (!best || s.score > best.score || (s.score === best.score && s.conflicts < best.conflicts)) best = s;
            }));
            return best ? Object.assign({ name: other }, best) : null;
        })
        .filter(s => s && s.conflicts === 0 && s.exact > 0)
        .sort((a, b) => b.score - a.score || b.exact - a.exact || a.name.localeCompare(b.name))
        .slice(0, n);
}

/* One ranked row: rank, ideology pill, bar, detail text and an optional Compare link.
   o = { rank, name, pct, meta, href, compareHref } */
function nvMakeRankRow(o) {
    const row = document.createElement('div');
    row.className = 'nv-closest-row';

    const rank = document.createElement('span');
    rank.className = 'nv-rank';
    rank.textContent = o.rank;

    const main = document.createElement('div');
    main.className = 'nv-closest-main';

    const link = document.createElement('a');
    link.className = 'nv-pill';
    link.href = o.href;
    link.textContent = o.name;
    link.style.backgroundColor = labelColors[o.name] || '#7a7a7a';

    const bar = document.createElement('div');
    bar.className = 'nv-bar';
    const fill = document.createElement('div');
    fill.className = 'nv-bar-fill';
    fill.style.width = o.pct + '%';
    bar.appendChild(fill);

    const meta = document.createElement('div');
    meta.className = 'nv-closest-meta';
    meta.textContent = o.meta;

    main.appendChild(link);
    main.appendChild(bar);
    main.appendChild(meta);
    row.appendChild(rank);
    row.appendChild(main);

    if (o.compareHref) {
        const cmp = document.createElement('a');
        cmp.className = 'nv-change';
        cmp.href = o.compareHref;
        cmp.textContent = 'Compare';
        row.appendChild(cmp);
    }
    return row;
}
