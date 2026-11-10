/* NeoNeoValues service worker: lets the site load instantly and work offline once it has been visited.

   Strategy: "stale while revalidate". A cached copy is shown immediately and refreshed in the
   background, so the next visit gets the newest version. Everything below the GENERATED markers is
   rewritten by tools/build.py (it lists every file to keep and names the cache after their contents,
   so a changed site automatically replaces the old cache). Do not edit that block by hand. */

// GENERATED-BEGIN
const CACHE = 'nnv-92b5453de7';
const PRECACHE = [
    "./",
    "index.html",
    "Instruction.html",
    "quiz.html",
    "results.html",
    "ideologies.html",
    "values.html",
    "description.html",
    "compare.html",
    "builder.html",
    "style.css",
    "theme.js",
    "pwa.js",
    "data.js",
    "mods.js",
    "criteria.js",
    "questions_tree.js",
    "quiz.js",
    "export.js",
    "share.js",
    "icons_data.js",
    "manifest.webmanifest",
    "icon.svg",
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
    "apple-touch-icon.png",
    "icons/authority/absolute.svg",
    "icons/authority/anarchism.svg",
    "icons/authority/anarcho_monarchism.svg",
    "icons/authority/aristocracy.svg",
    "icons/authority/autocracy.svg",
    "icons/authority/constitutional.svg",
    "icons/authority/direct_democracy.svg",
    "icons/authority/meritocracy.svg",
    "icons/authority/minarchism.svg",
    "icons/authority/neocameralism.svg",
    "icons/authority/partocracy.svg",
    "icons/authority/religious_authoritarianism.svg",
    "icons/authority/representative_democracy.svg",
    "icons/authority/stratocracy.svg",
    "icons/authority/technocracy.svg",
    "icons/authority/theocracy.svg",
    "icons/authority/totalitarianism.svg",
    "icons/culture/alternative_modernism.svg",
    "icons/culture/civil_liberalism.svg",
    "icons/culture/conservatism.svg",
    "icons/culture/conservative_liberalism.svg",
    "icons/culture/liberal_conservatism.svg",
    "icons/culture/neoreactionaryism.svg",
    "icons/culture/paleoconservatism.svg",
    "icons/culture/perennial_traditionalism.svg",
    "icons/culture/postmodernism.svg",
    "icons/culture/progressive_conservatism.svg",
    "icons/culture/progressivism.svg",
    "icons/culture/reactionary_modernism.svg",
    "icons/culture/reactionaryism.svg",
    "icons/culture/religious_traditionalism.svg",
    "icons/culture/social_progressivism.svg",
    "icons/culture/traditionalist_conservatism.svg",
    "icons/economics/agrarian_socialism.svg",
    "icons/economics/cameralism.svg",
    "icons/economics/communization.svg",
    "icons/economics/corporatism.svg",
    "icons/economics/countereconomics.svg",
    "icons/economics/dirigisme.svg",
    "icons/economics/distributism.svg",
    "icons/economics/feudalism.svg",
    "icons/economics/free_market_distributism.svg",
    "icons/economics/free_socialism.svg",
    "icons/economics/guild_socialism.svg",
    "icons/economics/keynesianism.svg",
    "icons/economics/laissez_faire.svg",
    "icons/economics/market_socialism.svg",
    "icons/economics/mutual_distributism.svg",
    "icons/economics/mutualism.svg",
    "icons/economics/neo_corporatism.svg",
    "icons/economics/social_capitalism.svg",
    "icons/economics/social_corporatism.svg",
    "icons/economics/social_distributism.svg",
    "icons/economics/socialism.svg",
    "icons/economics/state_capitalism.svg",
    "icons/economics/state_socialism.svg",
    "icons/economics/syndicalism.svg",
    "icons/economics/third_way.svg",
    "icons/economics/utopian_socialism.svg",
    "icons/economics/welfare_capitalism.svg",
    "icons/economics/yellow_socialism.svg",
    "icons/foreign/Globalism.svg",
    "icons/foreign/Imperialism.svg",
    "icons/foreign/Internationalism.svg",
    "icons/foreign/Interventionism.svg",
    "icons/foreign/Isolationism.svg",
    "icons/foreign/Non_Interventionism.svg",
    "icons/foreign/Realpolitik.svg",
    "icons/foreign/alter_globalism.svg",
    "icons/foreign/armed_neutrality.svg",
    "icons/nation/Cosmopolitanism.svg",
    "icons/nation/Tribalism.svg",
    "icons/nation/civic_nationalism.svg",
    "icons/nation/civilizationism.svg",
    "icons/nation/communitarianism.svg",
    "icons/nation/cultural_nationalism.svg",
    "icons/nation/egoism.svg",
    "icons/nation/ethnic_nationalism.svg",
    "icons/nation/pan_nationalism.svg",
    "icons/nation/racial_nationalism.svg",
    "icons/nation/religious_nationalism.svg",
    "icons/nation/romantic_nationalism.svg",
    "icons/resource_management/Confiscatory_Taxation.svg",
    "icons/resource_management/Progressive_Taxation.svg",
    "icons/resource_management/Voluntaryism.svg",
    "icons/resource_management/collective_distribution.svg",
    "icons/resource_management/flat_taxation.svg",
    "icons/resource_management/lvt.svg",
    "icons/social_control/civic_paternalism.svg",
    "icons/social_control/civil_libertarianism.svg",
    "icons/social_control/disciplinarianism.svg",
    "icons/social_control/legal_moralism.svg",
    "icons/social_control/permissivism.svg",
    "icons/social_control/regimentalism.svg",
    "icons/social_control/securitism.svg",
    "icons/social_control/totalism.svg",
    "icons/technology/conservationism.svg",
    "icons/technology/ecomodernism.svg",
    "icons/technology/environmentalism.svg",
    "icons/technology/extropianism.svg",
    "icons/technology/industrialism.svg",
    "icons/technology/instrumentalism.svg",
    "icons/technology/neoluddism.svg",
    "icons/technology/posthumanism.svg",
    "icons/technology/primitivism.svg",
    "icons/technology/prometheanism.svg",
    "icons/technology/techno_fatalism.svg",
    "icons/technology/technocapitalism.svg",
    "icons/technology/transhumanism.svg",
    "icons/territorial_organization/centralism.svg",
    "icons/territorial_organization/confederalism.svg",
    "icons/territorial_organization/federalism.svg",
    "icons/territorial_organization/hypercentralism.svg",
    "icons/territorial_organization/municipalism.svg",
    "icons/territorial_organization/regionalism.svg"
];
// GENERATED-END

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // add files one by one so a single missing file can not break the whole install
        await Promise.all(PRECACHE.map(path =>
            cache.add(new Request(new URL(path, self.registration.scope).href, { cache: 'reload' })).catch(() => {})
        ));
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(n => n.startsWith('nnv-') && n !== CACHE).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;          // fonts and anything else: leave to the network
    if (url.searchParams.has('nvcheck') || url.pathname.endsWith('/check.html')) return;   // the file check must see the real server

    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        // ignore ?query so results.html?s=... and results.html?r=... both use the one cached page
        const key = new Request(url.origin + url.pathname);
        const cached = await cache.match(key);

        const refresh = fetch(req).then(res => {
            if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
            return res;
        }).catch(() => null);

        if (cached) { event.waitUntil(refresh); return cached; }

        const fresh = await refresh;
        if (fresh) return fresh;

        if (req.mode === 'navigate') {
            const home = await cache.match(new Request(new URL('index.html', self.registration.scope).href));
            if (home) return home;
        }
        return new Response('You are offline and this page has not been saved yet.', {
            status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    })());
});
