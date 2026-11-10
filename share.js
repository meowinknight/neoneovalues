/* NeoNeoValues: "copy link to my results" window.
   Your results live inside the link itself (nothing is stored on a server), so anyone who opens it
   sees the same results. The link is always shown in a selectable box, because some in-app browsers
   accept a "copy" request without actually copying anything. */

function nvBuildShareUrl(results) {
    const compact = encodeURIComponent(nvEncodeResults(results)).replace(/%2C/g, ',');
    return window.location.origin + window.location.pathname + '?s=' + compact;
}

function nvShowShareLink(url, opts) {
    opts = opts || {};
    const overlay = document.createElement('div');
    overlay.className = 'nv-modal-overlay';
    const box = document.createElement('div');
    box.className = 'nv-modal nv-share-box';

    const title = document.createElement('h2');
    title.className = 'nv-share-title';
    title.textContent = opts.title || 'Share your results';

    const input = document.createElement('input');
    input.className = 'nv-input nv-share-input';
    input.type = 'text';
    input.readOnly = true;
    input.value = url;
    input.setAttribute('aria-label', 'Link to your results');
    input.addEventListener('focus', () => input.select());

    const status = document.createElement('p');
    status.className = 'nv-modal-hint';
    status.textContent = opts.note || 'Anyone with this link sees these results. Nothing is saved on a server.';

    const row = document.createElement('div');
    row.className = 'nv-modal-actions';

    const flash = (btn, text) => {
        const old = btn.dataset.label || btn.textContent;
        btn.dataset.label = old;
        btn.textContent = text;
        setTimeout(() => { btn.textContent = old; }, 2200);
    };

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'nv-modal-btn';
    copy.textContent = 'Copy link';
    copy.onclick = async () => {
        input.focus();
        input.select();
        let ok = false;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(url); ok = true; }
        } catch (e) {}
        if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} }
        if (ok) { flash(copy, 'Copied!'); }
        else { status.textContent = 'The link is selected. Press and hold it to copy.'; flash(copy, 'Select & copy'); }
    };
    row.appendChild(copy);

    if (navigator.share) {
        const share = document.createElement('button');
        share.type = 'button';
        share.textContent = 'Share\u2026';
        share.onclick = async () => {
            try { await navigator.share({ title: opts.shareTitle || 'My NeoNeoValues results', url }); }
            catch (e) { if (e && e.name !== 'AbortError') flash(share, 'Sharing failed'); }
        };
        row.appendChild(share);
    }

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    row.appendChild(close);

    function closeAll() { document.removeEventListener('keydown', onKey); overlay.remove(); }
    function onKey(e) { if (e.key === 'Escape') closeAll(); }
    close.onclick = closeAll;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAll(); });
    document.addEventListener('keydown', onKey);

    box.appendChild(title);
    box.appendChild(input);
    box.appendChild(row);
    box.appendChild(status);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
    input.select();
}
