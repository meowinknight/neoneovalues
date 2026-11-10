/* NeoNeoValues: offline support + "Install app" button.
   The service worker is only registered on https sites (such as GitHub Pages), so editing the files
   locally never shows you stale copies. For testing on localhost, set window.NV_FORCE_SW = true first. */
(function () {
    const allowed = location.protocol === 'https:' || window.NV_FORCE_SW === true;
    if ('serviceWorker' in navigator && allowed) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        });
    }

    // "Install app" button on the main menu, shown only when the browser says the site can be installed
    let deferredPrompt = null;
    const onMenu = /(^|\/)(index\.html)?$/.test(location.pathname);

    function showInstallButton() {
        const holder = document.getElementById('buttons');
        if (!onMenu || !holder || document.getElementById('install-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'install-btn';
        btn.type = 'button';
        btn.textContent = 'Install app';
        btn.onclick = async function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            try { await deferredPrompt.userChoice; } catch (e) {}
            deferredPrompt = null;
            btn.remove();
        };
        holder.appendChild(btn);
    }

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showInstallButton);
        else showInstallButton();
    });
    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        const b = document.getElementById('install-btn');
        if (b) b.remove();
    });
})();
