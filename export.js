/* NeoNeoValues: export your results as a PNG image.

   Layout (1600 x 900, rendered at 2x):
     left card  - your values (badge + name for each category)
     right card - your match, then your closest ideologies
     bottom right corner - small "NeoNeoValues" watermark
   Colours follow the current light/dark theme. */

const NV_EXPORT = { W: 1600, H: 900, SCALE: 2 };
const NV_FONT = 'Quicksand, "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

/* ---------- loading helpers ---------- */

function nvLoadIconBundle() {
    if (window.NV_ICON_SVG) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'icons_data.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('icons_data.js could not be loaded'));
        document.head.appendChild(s);
    });
}

function nvLoadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const load = Promise.all([
        document.fonts.load('700 24px Quicksand'),
        document.fonts.load('500 18px Quicksand')
    ]).catch(() => {});
    return Promise.race([load, new Promise(r => setTimeout(r, 1500))]);
}

function nvLoadIcon(cat, id) {
    return new Promise(resolve => {
        const svg = window.NV_ICON_SVG && window.NV_ICON_SVG[cat + '/' + id];
        if (!svg) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
}

/* ---------- drawing helpers ---------- */

function nvRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function nvSetSpacing(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

/* Largest font size (max..min) at which `text` fits in maxW; returns the size (or min). */
function nvFitSize(ctx, text, weight, maxSize, minSize, maxW) {
    for (let s = maxSize; s >= minSize; s -= 1) {
        ctx.font = `${weight} ${s}px ${NV_FONT}`;
        if (ctx.measureText(text).width <= maxW) return s;
    }
    return minSize;
}

/* Greedy word wrap into at most maxLines lines (last line gets an ellipsis if cut). */
function nvWrap(ctx, text, maxW, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        if (ctx.measureText(test).width <= maxW || !line) { line = test; }
        else { lines.push(line); line = words[i]; }
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
        let last = lines.slice(maxLines - 1).join(' ');
        while (last.length > 1 && ctx.measureText(last + '\u2026').width > maxW) last = last.slice(0, -1);
        lines.length = maxLines - 1;
        lines.push(last + '\u2026');
    }
    return lines;
}

function nvTrimToWidth(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '\u2026').width > maxW) t = t.slice(0, -1);
    return t + '\u2026';
}

/* ---------- main renderer ----------
   data = {
     values:  [{ cat, id, name, catTitle }],            // your 9 results, in quiz order
     match:   { name, color } | null,                   // null = no exact match
     closest: [{ name, color, pct, exact, total, close }]
   } */
async function nvRenderResultsPng(data) {
    await Promise.all([nvLoadIconBundle(), nvLoadFonts()]);
    const icons = await Promise.all(data.values.map(v => nvLoadIcon(v.cat, v.id)));

    const { W, H, SCALE } = NV_EXPORT;
    const canvas = document.createElement('canvas');
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.textBaseline = 'alphabetic';

    const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const bg = css('--bg-color') || '#18181b';
    const cardBg = css('--card-bg') || '#27272a';
    const text = css('--text-primary') || '#f4f4f5';
    const dim = css('--text-dim') || '#a1a1aa';
    const border = css('--border-color') || 'rgba(255,255,255,0.08)';
    const good = 'rgb(' + (css('--nv-good-rgb') || '74, 222, 128') + ')';

    // background + the two cards
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    [[40, 40, 760, 800], [830, 40, 730, 800]].forEach(([x, y, w, h]) => {
        nvRoundRect(ctx, x, y, w, h, 28);
        ctx.fillStyle = cardBg; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = border; ctx.stroke();
    });

    const heading = (label, x, y) => {
        ctx.fillStyle = dim; ctx.textAlign = 'left';
        ctx.font = `700 20px ${NV_FONT}`; nvSetSpacing(ctx, 3);
        ctx.fillText(label, x, y); nvSetSpacing(ctx, 0);
    };

    /* ---------- LEFT: your values ---------- */
    heading('YOUR VALUES', 80, 100);
    const gridX = 80, colW = 680 / 3;
    data.values.forEach((v, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const cx = gridX + colW * col + colW / 2;
        const top = 135 + row * 225;

        const icon = icons[i];
        if (icon) {
            ctx.drawImage(icon, cx - 60, top, 120, 120);
        } else {
            ctx.beginPath(); ctx.arc(cx, top + 60, 58, 0, Math.PI * 2);
            ctx.fillStyle = dim; ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = dim;
        nvSetSpacing(ctx, 1.5);
        const catText = (v.catTitle || '').toUpperCase();
        const catSize = nvFitSize(ctx, catText, 700, 14, 10, colW - 24);
        ctx.font = `700 ${catSize}px ${NV_FONT}`;
        ctx.fillText(catText, cx, top + 148); nvSetSpacing(ctx, 0);

        ctx.fillStyle = text;
        const nameText = v.name.toUpperCase();
        const longestWord = nameText.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
        const nameSize = nvFitSize(ctx, longestWord, 700, 21, 13, colW - 20);   // the widest word must fit its column
        ctx.font = `700 ${nameSize}px ${NV_FONT}`;
        const lines = nvWrap(ctx, nameText, colW - 20, 2);
        lines.forEach((ln, li) => ctx.fillText(ln, cx, top + 176 + li * (nameSize + 4)));
    });

    /* ---------- RIGHT: your match ---------- */
    const rx = 870, rw = 650;
    heading('YOUR MATCH', rx, 100);

    const matchName = data.match ? data.match.name : 'No exact match';
    const matchColor = data.match ? (data.match.color || '#7a7a7a') : '#7a7a7a';
    const padX = 32, maxTextW = rw - padX * 2;
    let lines, fontSize, lineH;
    const oneLine = nvFitSize(ctx, matchName, 700, 46, 30, maxTextW);
    ctx.font = `700 ${oneLine}px ${NV_FONT}`;
    if (ctx.measureText(matchName).width <= maxTextW) {
        lines = [matchName]; fontSize = oneLine;
    } else {
        fontSize = 36;
        ctx.font = `700 ${fontSize}px ${NV_FONT}`;
        lines = nvWrap(ctx, matchName, maxTextW, 2);
    }
    lineH = Math.round(fontSize * 1.2);
    ctx.font = `700 ${fontSize}px ${NV_FONT}`;
    const textW = Math.max(...lines.map(l => ctx.measureText(l).width));
    const pillW = Math.min(rw, textW + padX * 2);
    const pillH = lines.length * lineH + 36;
    const pillY = 128;
    nvRoundRect(ctx, rx, pillY, pillW, pillH, Math.min(pillH / 2, 46));
    ctx.fillStyle = matchColor; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    lines.forEach((ln, i) => ctx.fillText(ln, rx + pillW / 2, pillY + 18 + fontSize * 0.95 + i * lineH));

    /* ---------- RIGHT: closest matches ---------- */
    heading('CLOSEST MATCHES', rx, 300);
    data.closest.slice(0, 5).forEach((c, i) => {
        const y = 326 + i * 96;
        // name pill
        ctx.textAlign = 'left';
        const fs = nvFitSize(ctx, c.name, 700, 22, 14, 430);
        ctx.font = `700 ${fs}px ${NV_FONT}`;
        const label = nvTrimToWidth(ctx, c.name, 430);
        const w = ctx.measureText(label).width + 36;
        nvRoundRect(ctx, rx, y, w, 36, 18);
        ctx.fillStyle = c.color || '#7a7a7a'; ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, rx + 18, y + 24);

        // percentage on the right
        ctx.textAlign = 'right'; ctx.fillStyle = text;
        ctx.font = `700 26px ${NV_FONT}`;
        ctx.fillText(c.pct + '%', rx + rw, y + 28);

        // bar
        nvRoundRect(ctx, rx, y + 48, rw, 8, 4);
        ctx.fillStyle = 'rgba(128,128,128,0.25)'; ctx.fill();
        nvRoundRect(ctx, rx, y + 48, Math.max(8, rw * c.pct / 100), 8, 4);
        ctx.fillStyle = good; ctx.fill();

        // detail
        ctx.textAlign = 'left'; ctx.fillStyle = dim;
        ctx.font = `500 17px ${NV_FONT}`;
        let meta = `${c.exact} of ${c.total} criteria`;
        if (c.close) meta += ` (+${c.close} close)`;
        ctx.fillText(meta, rx, y + 80);
    });

    /* ---------- watermark (bottom-right corner) ---------- */
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.textAlign = 'right';
    ctx.fillStyle = text;
    ctx.font = `700 24px ${NV_FONT}`;
    ctx.fillText('NeoNeoValues', W - 44, H - 26);
    ctx.restore();

    return new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create the image')), 'image/png');
    });
}

/* ---------- preview window: share / copy / download ---------- */

/* Android in-app browsers (WebViews) can not download blob: files; their download handler only accepts
   http(s) addresses and crashes otherwise. In those we never offer the Download button. */
function nvIsAndroidWebView() {
    const ua = navigator.userAgent || '';
    if (!/Android/i.test(ua)) return false;
    return /;\s*wv\)/.test(ua) || (/Version\/\d/.test(ua) && /Chrome\/\d/.test(ua));
}

function nvShowExportPreview(blob, filename) {
    const url = URL.createObjectURL(blob);
    const file = (typeof File === 'function') ? new File([blob], filename, { type: 'image/png' }) : null;

    const webView = nvIsAndroidWebView();
    const canShare = !!(file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
    const canCopy = !!(navigator.clipboard && navigator.clipboard.write && window.ClipboardItem);
    const canDownload = !webView;

    const overlay = document.createElement('div');
    overlay.className = 'nv-modal-overlay';
    const box = document.createElement('div');
    box.className = 'nv-modal';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Your NeoNeoValues results';
    img.className = 'nv-modal-img';

    const row = document.createElement('div');
    row.className = 'nv-modal-actions';

    const flash = (btn, text) => {
        const old = btn.dataset.label || btn.textContent;
        btn.dataset.label = old;
        btn.textContent = text;
        setTimeout(() => { btn.textContent = old; }, 2200);
    };

    if (canShare) {
        const share = document.createElement('button');
        share.type = 'button';
        share.className = 'nv-modal-btn';
        share.textContent = 'Share / Save';
        share.onclick = async () => {
            try { await navigator.share({ files: [file], title: 'My NeoNeoValues results' }); }
            catch (e) { if (e && e.name !== 'AbortError') flash(share, 'Sharing failed'); }
        };
        row.appendChild(share);
    }

    if (canDownload) {
        const dl = document.createElement('a');
        dl.className = 'nv-modal-btn';
        dl.href = url;
        dl.download = filename;
        dl.textContent = 'Download PNG';
        row.appendChild(dl);
    }

    if (canCopy) {
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.textContent = 'Copy image';
        copy.onclick = async () => {
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                flash(copy, 'Copied!');
            } catch (e) { flash(copy, 'Copy not allowed'); }
        };
        row.appendChild(copy);
    }

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    row.appendChild(close);

    const hint = document.createElement('p');
    hint.className = 'nv-modal-hint';
    if (webView && !canShare) {
        hint.textContent = "This in-app browser can't save files. " +
            (canCopy ? 'Use Copy image, or open' : 'Open') + ' this page in Chrome or another browser to download the PNG.';
    } else if (canShare || 'ontouchstart' in window) {
        hint.textContent = 'On a phone you can also press and hold the image to save it.';
    } else {
        hint.textContent = '';
    }

    function closeAll() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        URL.revokeObjectURL(url);
    }
    function onKey(e) { if (e.key === 'Escape') closeAll(); }
    close.onclick = closeAll;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAll(); });
    document.addEventListener('keydown', onKey);

    box.appendChild(img);
    box.appendChild(row);
    if (hint.textContent) box.appendChild(hint);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const first = row.querySelector('.nv-modal-btn') || close;
    first.focus();
}
