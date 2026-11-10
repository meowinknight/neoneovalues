/* NeoNeoValues theme handling.
   One theme (light/dark) for the whole site, toggled from the corner button on every page.

   The choice is saved in two places so it follows you from page to page:
   - window.name  (survives navigation inside a tab, even when pages are opened straight from disk,
                   where some browsers do not share localStorage between files)
   - localStorage (remembered for next time, shared between tabs when the browser allows it)
   The window.name copy wins on load because it is always the most recent choice made in this tab. */
(function () {
    const KEY = 'nv_theme';
    const NAME_RE = /(?:^|;)nv_theme=(light|dark)(?=;|$)/;

    function readName() {
        try { const m = NAME_RE.exec(window.name || ''); return m ? m[1] : null; } catch (e) { return null; }
    }
    function writeName(theme) {
        try {
            const rest = (window.name || '').replace(NAME_RE, '').replace(/^;+|;+$/g, '');
            window.name = (rest ? rest + ';' : '') + KEY + '=' + theme;
        } catch (e) {}
    }
    function readStore() {
        try { const t = localStorage.getItem(KEY); return (t === 'light' || t === 'dark') ? t : null; } catch (e) { return null; }
    }
    function writeStore(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) {}
    }

    function currentSaved() { return readName() || readStore() || 'dark'; }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // apply as early as possible (this script is loaded in <head>) to avoid a flash
    const initial = currentSaved();
    apply(initial);
    writeName(initial);
    writeStore(initial);

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        apply(next);
        writeName(next);
        writeStore(next);
    };

    // another tab changed the theme (only fires where localStorage is shared)
    window.addEventListener('storage', function (e) {
        if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
            apply(e.newValue);
            writeName(e.newValue);
        }
    });

    // coming back to a page from the back/forward cache: re-read so it matches the rest of the site
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) { const t = currentSaved(); apply(t); writeName(t); }
    });

    window.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('.theme-toggle-corner')) return;
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle-corner';
        toggleBtn.type = 'button';
        toggleBtn.setAttribute('onclick', 'toggleTheme()');
        toggleBtn.setAttribute('aria-label', 'Toggle light/dark mode');
        toggleBtn.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
                <path d="M0,0 L250,250 L250,0 Z"></path>
                <!-- Sun Icon (visible in dark mode) -->
                <g class="icon-sun" transform="translate(142, 52) scale(2.2)">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                </g>
                <!-- Moon Icon (visible in light mode) -->
                <g class="icon-moon" transform="translate(142, 52) scale(2.2)">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </g>
            </svg>
        `;
        document.body.prepend(toggleBtn);
    });
})();

/* If a site file fails to load, or a script crashes because one is missing or out of date, say so on any page
   (the quiz page has its own notice). The message links to the file check. */
(function () {
    var shown = [];
    function fname(u) { return String(u || '').split('/').pop().split('?')[0]; }
    function banner() {
        if (document.getElementById('quiz-warning') || document.querySelector('.nv-warning') || !document.body) return;
        var el = document.getElementById('nv-site-problem');
        if (!el) {
            el = document.createElement('div');
            el.id = 'nv-site-problem';
            el.setAttribute('role', 'alert');
            el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:3000;padding:12px 16px;background:#7f1d1d;color:#fff;' +
                'font:14px/1.45 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;text-align:center';
            document.body.appendChild(el);
        }
        el.textContent = '';
        el.appendChild(document.createTextNode('Part of the site did not load properly (' + shown.join('; ') + '). Reload the page, or '));
        var a = document.createElement('a');
        a.href = 'check.html'; a.textContent = 'run the file check';
        a.style.cssText = 'color:#fff;font-weight:700';
        el.appendChild(a);
        el.appendChild(document.createTextNode('.'));
    }
    window.addEventListener('error', function (e) {
        var t = e.target, msg;
        if (t && t.tagName === 'SCRIPT' && t.src) msg = fname(t.src) + ' could not be loaded';
        else if (e.message && !/site files missing/.test(e.message) &&
                 /is not defined|is not a function|Unexpected|Invalid or unexpected/.test(e.message)) {
            msg = fname(e.filename) + ': ' + String(e.message).replace(/^Uncaught\s*/, '');
        } else return;
        if (shown.length < 3 && shown.indexOf(msg) < 0) shown.push(msg);
        if (document.body) banner(); else document.addEventListener('DOMContentLoaded', banner);
    }, true);
})();
