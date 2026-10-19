(function (w, d) {
'use strict';
var API_HOST = 'https://elms-backend-1-tr5h.onrender.com';
safe(function () {
var clean = { '/landing.html': '/', '/pricing.html': '/plans', '/policy.html': '/privacy', '/privacy.html': '/privacy', '/terms.html': '/terms', '/refund.html': '/refund', '/user-guide.html': '/user-guide', '/affiliate-terms.html': '/affiliate-terms', '/copyright.html': '/copyright', '/contact.html': '/contact', '/track.html': '/track' };
var to = clean[w.location.pathname];
if (to && w.history && w.history.replaceState) { w.history.replaceState(null, '', to + w.location.search + w.location.hash); }
});
safe(function () {
var root = d.documentElement;
if ((' ' + root.className + ' ').indexOf(' js ') === -1) { root.className += ' js'; }
});
try {
var host = w.location.hostname;
w.ELMS_API = (host === 'localhost' || host === '127.0.0.1') ? '' : API_HOST;
} catch (e) {
w.ELMS_API = API_HOST;
}
function safe(fn) {
try { fn(); } catch (e) { return; }
}
function each(list, fn) {
for (var i = 0; i < list.length; i++) { fn(list[i], i); }
}
function qsa(sel, root) {
return (root || d).querySelectorAll(sel);
}
function el(tag, cls, text) {
var n = d.createElement(tag);
if (cls) { n.className = cls; }
if (text !== undefined && text !== null) { n.textContent = text; }
return n;
}
function matches(query) {
return !!(w.matchMedia && w.matchMedia(query).matches);
}
function onChange(mq, fn) {
if (!mq) { return; }
if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
}
function ready(fn) {
if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', function () { safe(fn); }); } else { safe(fn); }
}
function initYear() {
var y = String(new Date().getFullYear());
each(qsa('[data-year]'), function (n) { n.textContent = y; });
}
function initMenu() {
var btn = d.querySelector('[data-menu-btn]');
var nav = d.querySelector('[data-site-nav]');
var header = d.querySelector('[data-site-header]');
if (!btn || !nav) { return; }
function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
function setOpen(open, giveFocusBack) {
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
if (open) { nav.classList.add('is-open'); } else { nav.classList.remove('is-open'); }
if (!open && giveFocusBack) { btn.focus(); }
}
btn.addEventListener('click', function () { setOpen(!isOpen(), false); });
d.addEventListener('keydown', function (e) {
if (!isOpen() || (e.key !== 'Escape' && e.key !== 'Esc')) { return; }
var a = d.activeElement;
setOpen(false, !!(a && (a === btn || nav.contains(a))));
});
d.addEventListener('click', function (e) {
if (!isOpen()) { return; }
var t = e.target;
if (t && t.closest && t.closest('[data-site-nav] a')) { setOpen(false, false); return; }
if (!nav.contains(t) && !btn.contains(t)) { setOpen(false, false); }
});
d.addEventListener('focusin', function (e) {
if (isOpen() && header && !header.contains(e.target)) { setOpen(false, false); }
});
onChange(w.matchMedia ? w.matchMedia('(min-width: 60em)') : null, function () { setOpen(false, false); });
}
function initHeader() {
var header = d.querySelector('[data-site-header]');
if (!header) { return; }
var queued = false;
function update() {
queued = false;
var y = w.pageYOffset || d.documentElement.scrollTop || 0;
if (y > 6) { header.classList.add('is-stuck'); } else { header.classList.remove('is-stuck'); }
}
w.addEventListener('scroll', function () {
if (queued) { return; }
queued = true;
if (w.requestAnimationFrame) { w.requestAnimationFrame(update); } else { update(); }
}, { passive: true });
update();
}
function initCurrentLink() {
var alias = { '/pricing': '/plans', '/policy': '/privacy', '/landing': '/', '/index': '/' };
function norm(p) {
p = String(p || '/').split('?')[0].replace(/\/+$/, '').replace(/\.html$/, '') || '/';
return alias[p] || p;
}
var path = norm(w.location.pathname);
each(qsa('[data-site-nav] .site-nav__link'), function (a) {
var href = a.getAttribute('href') || '';
if (href.indexOf('#') !== -1 || href.charAt(0) !== '/') { return; }
if (norm(href) === path) { a.setAttribute('aria-current', 'page'); }
});
}
/* Scroll reveals. Blocks below the first screen start hidden and settle in once they are seen; blocks that enter together follow each other by a short delay. Everything stays visible without script, with reduced motion, in print, and when the observer does not report. */
function showPending() {
each(qsa('.reveal--pending'), function (n) { n.classList.remove('reveal--pending'); n.classList.add('is-in'); });
}
function initReveal() {
if (!('IntersectionObserver' in w) || matches('(prefers-reduced-motion: reduce)')) { return; }
var skip = '.reveal, .reveal-seq, .hero, .page-hero, .site-header, [data-demo]';
each(qsa('.section-head, .bento__item, .cards > *, .mailboxes > *, .split > *, .faq__item, .callout--brief, .band, .steps, .howto, .site-footer__grid > *, .site-footer__legal'), function (n) {
if (n.classList.contains('howto') && n.closest('.doc__main')) { return; }
if (!n.closest(skip)) { n.classList.add('reveal'); }
});
each(qsa('.conditions, .table-wrap'), function (n) {
if (n.parentElement && n.parentElement.closest('.reveal, .reveal-seq')) { return; }
n.classList.remove('reveal');
n.classList.add('reveal-seq');
each(n.classList.contains('table-wrap') ? qsa('tbody tr', n) : n.children, function (k, i) { k.style.setProperty('--i', Math.min(i, 8)); });
});
var items = qsa('.reveal, .reveal-seq');
if (!items.length) { return; }
var vh = w.innerHeight || d.documentElement.clientHeight || 800;
var fired = false;
var io = new w.IntersectionObserver(function (entries) {
var seen = [];
fired = true;
each(entries, function (en) { if (en.isIntersecting) { seen.push(en); } });
seen.sort(function (a, b) {
var ra = Math.round(a.boundingClientRect.top / 8);
var rb = Math.round(b.boundingClientRect.top / 8);
return ra - rb || a.boundingClientRect.left - b.boundingClientRect.left;
});
each(seen, function (en, i) {
var n = en.target;
if (!/(^| )reveal--d\d/.test(n.className)) { n.style.setProperty('--rd', Math.min(i, 5) * 0.07 + 's'); }
n.classList.remove('reveal--pending');
n.classList.add('is-in');
io.unobserve(n);
});
}, { rootMargin: '0px 0px -' + Math.min(Math.round(vh * 0.06), 40) + 'px 0px', threshold: 0.04 });
var hold = [];
each(items, function (n) {
if (n.getBoundingClientRect().top > vh * 0.92) {
n.style.transition = 'none';
n.classList.add('reveal--pending');
hold.push(n);
io.observe(n);
} else {
n.classList.add('is-in');
}
});
void d.documentElement.offsetWidth;
each(hold, function (n) { n.style.transition = ''; });
w.setTimeout(function () {
each(qsa('.reveal--pending'), function (n) {
var r = n.getBoundingClientRect();
if (!fired || (r.top < vh && r.bottom > 0)) { n.classList.remove('reveal--pending'); n.classList.add('is-in'); }
});
}, 3000);
}
/* The header pill glides to the hovered, focused or current link (a pill built from two round caps and a stretched middle, so it keeps its shape at any width). */
function initNavGlide() {
var nav = d.querySelector('[data-site-nav]');
var links = qsa('[data-site-nav] .site-nav__link');
var wide = w.matchMedia ? w.matchMedia('(min-width: 60em)') : null;
if (!nav || !links.length || !wide || matches('(prefers-reduced-motion: reduce)')) { return; }
var glide = el('span', 'site-nav__glide');
glide.setAttribute('aria-hidden', 'true');
var caps = [el('i'), el('i'), el('i')];
each(caps, function (c) { glide.appendChild(c); });
nav.insertBefore(glide, nav.firstChild);
var cur = null;
var at = null;
function current() {
for (var i = 0; i < links.length; i++) { if (links[i].getAttribute('aria-current') === 'page') { return links[i]; } }
return null;
}
function put(a, snap) {
if (!a || !wide.matches) { glide.classList.remove('is-on'); nav.classList.remove('has-glide'); at = null; return; }
var nr = nav.getBoundingClientRect();
var r = a.getBoundingClientRect();
var h = r.height;
if (!r.width || !h) { return; }
if (snap || !glide.classList.contains('is-on')) { glide.classList.add('is-snap'); }
glide.style.height = h + 'px';
glide.style.transform = 'translate3d(' + (r.left - nr.left) + 'px,' + (r.top - nr.top) + 'px,0)';
caps[0].style.width = caps[2].style.width = h + 'px';
caps[1].style.left = (h / 2) + 'px';
caps[1].style.transform = 'scaleX(' + Math.max(r.width - h, 0) + ')';
caps[2].style.transform = 'translateX(' + Math.max(r.width - h, 0) + 'px)';
if (a === cur) { glide.setAttribute('data-cur', ''); } else { glide.removeAttribute('data-cur'); }
nav.classList.add('has-glide');
glide.classList.add('is-on');
at = a;
if (glide.classList.contains('is-snap')) { void glide.offsetWidth; glide.classList.remove('is-snap'); }
}
function rest(snap) {
cur = current();
if (cur) { put(cur, snap); } else { glide.classList.remove('is-on'); nav.classList.remove('has-glide'); at = null; }
}
each(links, function (a) {
a.addEventListener('mouseenter', function () { put(a, false); });
a.addEventListener('focus', function () { put(a, false); });
a.addEventListener('blur', function () { rest(false); });
});
nav.addEventListener('mouseleave', function () { rest(false); });
onChange(wide, function () { rest(true); });
w.addEventListener('resize', function () { if (at) { put(at, true); } });
w.addEventListener('load', function () { rest(true); });
if (d.fonts && d.fonts.ready) { d.fonts.ready.then(function () { rest(true); }); }
rest(true);
}
/* A thin bar under the header shows how far a long page has been read. */
function initProgress() {
var main = d.querySelector('.doc__main');
var header = d.querySelector('[data-site-header]');
if (!main || !header) { return; }
var bar = el('div', 'read-progress');
var fill = el('i');
var queued = false;
bar.setAttribute('aria-hidden', 'true');
bar.appendChild(fill);
header.appendChild(bar);
function update() {
queued = false;
var top = header.offsetHeight;
var r = main.getBoundingClientRect();
var total = r.height - ((w.innerHeight || 800) - top);
var p = total > 0 ? (top - r.top) / total : 0;
p = p < 0 ? 0 : (p > 1 ? 1 : p);
fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
bar.style.opacity = (total > 0 && p > 0.002) ? '1' : '0';
}
function schedule() {
if (queued) { return; }
queued = true;
if (w.requestAnimationFrame) { w.requestAnimationFrame(update); } else { update(); }
}
w.addEventListener('scroll', schedule, { passive: true });
w.addEventListener('resize', schedule);
d.addEventListener('elms:layout', schedule);
update();
}
/* The soft glow and grid behind a hero or a dark band drift slowly; they rest while scrolled out of view. */
function initAmbient() {
var els = qsa('.hero, .page-hero, .band--navy, .section--navy');
if (!els.length || !('IntersectionObserver' in w)) { return; }
var io = new w.IntersectionObserver(function (entries) {
each(entries, function (en) { en.target.classList.toggle('amb-off', !en.isIntersecting); });
}, { rootMargin: '80px' });
each(els, function (n) { io.observe(n); });
}
function initToc() {
var boxes = qsa('[data-toc]');
if (!boxes.length) { return; }
var wide = w.matchMedia ? w.matchMedia('(min-width: 64em)') : null;
var header = d.querySelector('[data-site-header]');
each(boxes, function (box) {
var summary = box.querySelector('summary');
var touched = false;
function sync() {
if (!wide) { return; }
if (wide.matches) { box.open = true; } else if (!touched) { box.open = false; }
if (summary) {
if (wide.matches) { summary.setAttribute('tabindex', '-1'); summary.setAttribute('aria-hidden', 'true'); } else { summary.removeAttribute('tabindex'); summary.removeAttribute('aria-hidden'); }
}
}
sync();
box.setAttribute('data-ready', '');
onChange(wide, function () { touched = false; sync(); });
if (summary) {
summary.addEventListener('click', function (e) {
if (wide && wide.matches) { e.preventDefault(); } else { touched = true; }
});
}
each(qsa('a[href^="#"]', box), function (a) {
a.addEventListener('click', function () {
if (wide && !wide.matches) { box.open = false; }
setActive(a.getAttribute('href').slice(1));
});
});
});
var links = qsa('.toc__link');
var pairs = [];
each(links, function (a) {
var id = (a.getAttribute('href') || '').slice(1);
var target = id ? d.getElementById(id) : null;
if (target) { pairs.push({ id: id, link: a, target: target }); }
});
if (!pairs.length) { return; }
var current = '';
var list = d.querySelector('.toc__list');
var marker = null;
if (list && !matches('(prefers-reduced-motion: reduce)')) {
marker = el('span', 'toc__marker');
marker.setAttribute('aria-hidden', 'true');
list.appendChild(marker);
list.classList.add('has-marker');
}
/* The blue marker slides from one contents link to the next. */
function place() {
if (!marker) { return; }
var a = list.querySelector('.toc__link.is-active');
var lr = list.getBoundingClientRect();
var r = a ? a.getBoundingClientRect() : null;
if (!r || !r.height || !lr.height) { marker.classList.remove('is-on'); return; }
var snap = !marker.classList.contains('is-on');
if (snap) { marker.classList.add('is-snap'); }
marker.style.transform = 'translate(' + (r.left - lr.left - list.clientLeft) + 'px,' + (r.top - lr.top - list.clientTop) + 'px) scaleY(' + r.height + ')';
marker.classList.add('is-on');
if (snap) { void marker.offsetWidth; marker.classList.remove('is-snap'); }
}
each(boxes, function (box) { box.addEventListener('toggle', place); });
w.addEventListener('resize', place);
w.addEventListener('load', place);
d.addEventListener('elms:layout', place);
function keepInView(a) {
var box = a.closest ? a.closest('.doc__aside') : null;
if (!box || box.scrollHeight <= box.clientHeight) { return; }
var r = a.getBoundingClientRect();
var b = box.getBoundingClientRect();
if (r.bottom > b.bottom - 8) { box.scrollTop += r.bottom - b.bottom + 8; } else if (r.top < b.top + 8) { box.scrollTop -= b.top - r.top + 8; }
}
function setActive(id) {
if (id === current) { return; }
current = id;
if (!id) { each(qsa('.doc__aside'), function (n) { n.scrollTop = 0; }); }
each(pairs, function (p) {
if (p.id === id) { p.link.classList.add('is-active'); p.link.setAttribute('aria-current', 'true'); keepInView(p.link); } else { p.link.classList.remove('is-active'); p.link.removeAttribute('aria-current'); }
});
place();
}
function line() { return (header ? header.offsetHeight : 64) + 28; }
function recompute() {
var l = line();
var found = '';
var last = '';
each(pairs, function (p) {
var r = p.target.getBoundingClientRect();
if (!r.height) { return; }
last = p.id;
if (r.top <= l) { found = p.id; }
});
if (last && (w.pageYOffset || 0) + (w.innerHeight || 0) >= d.documentElement.scrollHeight - 4) { found = last; }
setActive(found);
}
var queued = false;
function onScroll() {
if (queued) { return; }
queued = true;
if (w.requestAnimationFrame) { w.requestAnimationFrame(function () { queued = false; recompute(); }); } else { queued = false; recompute(); }
}
w.addEventListener('scroll', onScroll, { passive: true });
w.addEventListener('resize', onScroll);
w.addEventListener('hashchange', recompute);
w.setTimeout(recompute, 400);
recompute();
}
function initAnchors() {
var scope = qsa('.doc__main h2[id], .doc__main h3[id]');
each(scope, function (h) {
if (h.querySelector('.anchor')) { return; }
var a = el('a', 'anchor');
a.setAttribute('href', '#' + h.id);
a.setAttribute('aria-hidden', 'true');
a.setAttribute('tabindex', '-1');
h.appendChild(a);
});
var note = null;
var timer = 0;
var fade = 0;
d.addEventListener('click', function (e) {
var a = e.target && e.target.closest ? e.target.closest('a.anchor') : null;
if (!a || !w.navigator || !w.navigator.clipboard || !w.navigator.clipboard.writeText) { return; }
var url = w.location.origin + w.location.pathname + a.getAttribute('href');
w.navigator.clipboard.writeText(url).then(function () {
if (!note) {
note = el('div', 'copy-note', 'Link copied');
note.setAttribute('role', 'status');
}
note.classList.remove('is-out');
d.body.appendChild(note);
a.classList.add('is-copied');
w.clearTimeout(timer);
w.clearTimeout(fade);
fade = w.setTimeout(function () { note.classList.add('is-out'); a.classList.remove('is-copied'); }, 1550);
timer = w.setTimeout(function () { if (note && note.parentNode) { note.parentNode.removeChild(note); } }, 1800);
}, function () {});
});
}
function initOpenTarget() {
function open() {
var id = (w.location.hash || '').slice(1);
if (!id) { return; }
var t = d.getElementById(decodeURIComponent(id));
if (!t) { return; }
if (t.tagName === 'DETAILS') { t.open = true; }
var p = t.parentElement;
while (p) { if (p.tagName === 'DETAILS' && !p.hasAttribute('data-toc')) { p.open = true; } p = p.parentElement; }
}
open();
w.addEventListener('hashchange', function () { safe(open); });
}
function initFilter() {
var wrap = d.querySelector('[data-guide-filter]');
if (!wrap) { return; }
var input = wrap.querySelector('[data-guide-input]');
var status = wrap.querySelector('[data-guide-status]');
var empty = d.querySelector('[data-guide-empty]');
if (!input) { return; }
wrap.hidden = false;
var sections = [];
each(qsa('[data-filter-item]'), function (n) {
var outer = n.parentElement && n.parentElement.closest ? n.parentElement.closest('[data-filter-item]') : null;
if (!outer) {
var inner = qsa('[data-filter-item]', n);
var entries = [];
each(inner, function (e) { entries.push({ node: e, text: norm(e.textContent) }); });
var head = n.querySelector('h2, h3');
sections.push({ node: n, text: norm(n.textContent), head: norm(head ? head.textContent : ''), entries: entries });
}
});
function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function hit(text, terms) {
for (var i = 0; i < terms.length; i++) { if (text.indexOf(terms[i]) === -1) { return false; } }
return true;
}
function apply() {
var raw = input.value || '';
var q = norm(raw);
var terms = q ? q.split(' ') : [];
var shown = 0;
each(sections, function (s) {
var visible;
if (!terms.length) {
visible = true;
each(s.entries, function (e) { e.node.hidden = false; });
} else if (s.entries.length) {
var any = false;
var headHit = hit(s.head, terms);
each(s.entries, function (e) {
var m = headHit || hit(e.text, terms);
e.node.hidden = !m;
if (m) { any = true; }
});
visible = any || headHit;
} else {
visible = hit(s.text, terms);
}
s.node.hidden = !visible;
if (visible) { shown += 1; }
});
each(qsa('.toc__link'), function (a) {
var id = (a.getAttribute('href') || '').slice(1);
var t = id ? d.getElementById(id) : null;
var holder = t && t.closest ? t.closest('[data-filter-item]') : null;
var li = a.closest ? a.closest('li') : null;
if (li && holder) { li.hidden = holder.hidden; }
});
if (empty) { empty.hidden = !(terms.length && !shown); }
safe(function () { d.dispatchEvent(new w.Event('elms:layout')); });
if (status) {
if (!terms.length) { status.textContent = ''; } else if (!shown) { status.textContent = 'No sections match "' + raw.trim() + '".'; } else { status.textContent = shown + (shown === 1 ? ' section matches' : ' sections match') + ' "' + raw.trim() + '".'; }
}
}
var wait = 0;
input.addEventListener('input', function () { w.clearTimeout(wait); wait = w.setTimeout(function () { safe(apply); }, 120); });
input.addEventListener('keydown', function (e) {
if ((e.key === 'Escape' || e.key === 'Esc') && input.value) { input.value = ''; apply(); }
});
function showTarget(id, jump) {
var t = id ? d.getElementById(id) : null;
if (!t || !t.closest('[hidden]')) { return; }
input.value = '';
apply();
if (jump) { t.scrollIntoView(); }
}
d.addEventListener('click', function (e) {
var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
if (a) { safe(function () { showTarget(a.getAttribute('href').slice(1), false); }); }
});
w.addEventListener('hashchange', function () { safe(function () { showTarget(w.location.hash.slice(1), true); }); });
}
function initPrint() {
var opened = [];
w.addEventListener('beforeprint', function () {
showPending();
opened = [];
each(qsa('details'), function (n) { if (!n.open) { n.open = true; opened.push(n); } });
});
w.addEventListener('afterprint', function () {
each(opened, function (n) { n.open = false; });
opened = [];
});
}
var Plans = {};
function money(n) {
var isInt = n % 1 === 0;
try { return n.toLocaleString('en-US', { minimumFractionDigits: isInt ? 0 : 2, maximumFractionDigits: 2 }); } catch (e) { return isInt ? String(n) : n.toFixed(2); }
}
function whole(n) {
try { return Number(n).toLocaleString('en-US'); } catch (e) { return String(n); }
}
function clear(n) {
while (n.firstChild) { n.removeChild(n.firstChild); }
}
Plans.load = function (container, options) {
if (!container) { return; }
var opt = options || {};
var level = (opt.headingLevel >= 2 && opt.headingLevel <= 6) ? Math.floor(opt.headingLevel) : 3;
var ctaHref = opt.ctaHref || '/signup';
var ctaLabel = opt.ctaLabel || 'Get started';
var limit = opt.limit > 0 ? Math.floor(opt.limit) : 0;
var termNote = opt.termNote ? String(opt.termNote) : '';
clear(container);
var status = el('p', 'sr-only');
status.setAttribute('role', 'status');
var view = el('div');
view.setAttribute('tabindex', '-1');
container.appendChild(status);
container.appendChild(view);
function fetchOnce(done) {
var finished = false;
var ctl = w.AbortController ? new w.AbortController() : null;
function end(err, data) {
if (finished) { return; }
finished = true;
w.clearTimeout(timer);
done(err, data);
}
var timer = w.setTimeout(function () { if (ctl) { ctl.abort(); } end(new Error('timeout')); }, 20000);
if (!w.fetch) { end(new Error('unsupported')); return; }
var init = { credentials: 'omit' };
if (ctl) { init.signal = ctl.signal; }
w.fetch((w.ELMS_API || '') + '/api/payments/public-plans', init).then(function (r) {
if (!r.ok) { throw new Error('status'); }
return r.json();
}).then(function (data) { end(null, data); }, function (err) { end(err || new Error('failed')); });
}
function read(data) {
if (!data || data.success !== true || !Array.isArray(data.plans)) { return null; }
var list = [];
each(data.plans, function (p) {
if (!p || typeof p.name !== 'string' || !p.name) { return; }
var price = Number(p.priceUsd);
var credits = Number(p.credits);
if (!isFinite(price) || price < 0 || !isFinite(credits) || credits <= 0) { return; }
list.push({ name: p.name, price: price, credits: credits, stores: Number(p.maxEbayAccounts) });
});
list.sort(function (a, b) { return a.price - b.price; });
return limit ? list.slice(0, limit) : list;
}
function showLoading() {
clear(view);
container.setAttribute('aria-busy', 'true');
var ul = el('ul', 'plans');
ul.setAttribute('aria-hidden', 'true');
for (var i = 0; i < 2; i++) {
var li = el('li', 'plan plan--skeleton');
li.appendChild(el('span', 'skeleton skeleton--m'));
li.appendChild(el('span', 'skeleton skeleton--lg'));
li.appendChild(el('span', 'skeleton'));
li.appendChild(el('span', 'skeleton skeleton--s'));
li.appendChild(el('span', 'skeleton skeleton--btn'));
ul.appendChild(li);
}
view.appendChild(ul);
status.textContent = 'Loading plans';
}
function showMessage(text, isError, withRetry) {
clear(view);
container.setAttribute('aria-busy', 'false');
var box = el('div', 'plans__state' + (isError ? ' plans__state--error' : ''));
box.setAttribute('role', isError ? 'alert' : 'status');
box.appendChild(el('p', null, text));
if (withRetry) {
var b = el('button', 'btn btn--secondary', 'Retry');
b.setAttribute('type', 'button');
b.addEventListener('click', function () { run(); view.focus(); });
box.appendChild(b);
}
var p = el('p', 'small muted', 'You can also see the plans after you create your account. ');
var a = el('a', 'link-arrow');
a.setAttribute('href', ctaHref);
a.appendChild(el('span', null, 'Create an account'));
p.appendChild(a);
box.appendChild(p);
view.appendChild(box);
status.textContent = '';
}
function render(list) {
var hadFocus = container.contains(d.activeElement);
clear(view);
container.setAttribute('aria-busy', 'false');
var ul = el('ul', 'plans');
var planNo = 0;
each(list, function (p) {
var li = el('li', 'plan');
var nameEl = el('h' + level, 'plan__name', p.name);
nameEl.setAttribute('id', 'plan-name-' + (planNo += 1));
li.appendChild(nameEl);
var price = el('p', 'plan__price');
price.appendChild(el('span', 'plan__cur', 'USD'));
price.appendChild(el('span', 'plan__amount', money(p.price)));
li.appendChild(price);
if (termNote) { li.appendChild(el('p', 'plan__term', termNote)); }
var feats = el('ul', 'plan__features check-list');
feats.appendChild(el('li', null, whole(p.credits) + (p.credits === 1 ? ' credit' : ' credits')));
if (isFinite(p.stores) && p.stores > 0) { feats.appendChild(el('li', null, whole(p.stores) + (p.stores === 1 ? ' eBay store' : ' eBay stores'))); }
li.appendChild(feats);
var a = el('a', 'btn btn--primary plan__cta', ctaLabel);
a.setAttribute('href', ctaHref);
a.setAttribute('aria-describedby', nameEl.getAttribute('id'));
li.appendChild(a);
ul.appendChild(li);
});
view.appendChild(ul);
if (hadFocus) { try { view.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
status.textContent = list.length + (list.length === 1 ? ' plan loaded' : ' plans loaded');
if (typeof opt.onLoad === 'function') { safe(function () { opt.onLoad(list.length); }); }
}
var token = 0;
function run() {
token += 1;
var mine = token;
var tries = 0;
showLoading();
function attempt() {
fetchOnce(function (err, data) {
if (mine !== token) { return; }
var list = err ? null : read(data);
if (list === null) {
tries += 1;
if (tries <= 2) { w.setTimeout(attempt, 900 * tries); } else { showMessage('We could not load the plans just now. Please check your connection and try again.', true, true); }
return;
}
if (!list.length) { showMessage('The plans are not available to show right now. Please check back soon.', false, false); return; }
try { render(list); } catch (e) { showMessage('We could not load the plans just now. Please check your connection and try again.', true, true); }
});
}
attempt();
}
run();
};
w.ElmsPlans = Plans;
function initPlans() {
each(qsa('[data-elms-plans]'), function (box) {
function go() {
Plans.load(box, {
headingLevel: Number(box.getAttribute('data-heading-level')) || 3,
limit: Number(box.getAttribute('data-limit')) || 0,
ctaHref: box.getAttribute('data-cta-href') || '/signup',
ctaLabel: box.getAttribute('data-cta-label') || 'Get started',
termNote: box.getAttribute('data-term-note') || ''
});
}
if (!('IntersectionObserver' in w)) { go(); return; }
var io = new w.IntersectionObserver(function (entries) {
for (var i = 0; i < entries.length; i++) {
if (entries[i].isIntersecting) { io.disconnect(); go(); return; }
}
}, { rootMargin: '400px 0px' });
io.observe(box);
});
}
/* A table region takes the keyboard only while it really scrolls sideways. */
function initTableFocus() {
var wraps = d.querySelectorAll('.table-wrap[tabindex]');
if (!wraps.length) return;
function sync() {
Array.prototype.forEach.call(wraps, function (el) {
if (el.scrollWidth > el.clientWidth + 1) { el.setAttribute('tabindex', '0'); } else { el.removeAttribute('tabindex'); }
});
}
sync();
w.addEventListener('resize', function () { safe(sync); });
w.addEventListener('load', function () { safe(sync); });
}
/* The landing illustration only runs while it can be seen: it pauses when scrolled away or when the tab is hidden. */
function initDemo() {
var els = qsa('[data-demo]');
var seen = [];
if (!els.length) { return; }
function paint() {
each(els, function (n, i) { n.classList.toggle('demo-off', !!d.hidden || seen[i] === false); });
}
if ('IntersectionObserver' in w) {
var io = new w.IntersectionObserver(function (entries) {
each(entries, function (en) { seen[Array.prototype.indexOf.call(els, en.target)] = en.isIntersecting; });
paint();
}, { rootMargin: '60px' });
each(els, function (n) { io.observe(n); });
}
d.addEventListener('visibilitychange', paint);
paint();
}
safe(initPrint);
ready(function () {
safe(initYear);
safe(initMenu);
safe(initHeader);
safe(initCurrentLink);
safe(initNavGlide);
safe(initReveal);
safe(initProgress);
safe(initAmbient);
safe(initToc);
safe(initAnchors);
safe(initOpenTarget);
safe(initFilter);
safe(initPlans);
safe(initTableFocus);
safe(initDemo);
});
}(window, document));
