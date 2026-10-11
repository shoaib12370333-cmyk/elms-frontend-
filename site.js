(function (w, d) {
'use strict';
var API_HOST = 'https://elms-backend-1-tr5h.onrender.com';
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
function initReveal() {
var items = qsa('.reveal');
if (!items.length || !('IntersectionObserver' in w) || matches('(prefers-reduced-motion: reduce)')) { return; }
var vh = w.innerHeight || d.documentElement.clientHeight || 800;
var io = new w.IntersectionObserver(function (entries) {
each(entries, function (en) {
if (!en.isIntersecting) { return; }
en.target.classList.remove('reveal--pending');
en.target.classList.add('is-in');
io.unobserve(en.target);
});
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
each(items, function (n) {
if (n.getBoundingClientRect().top > vh * 0.92) {
n.classList.add('reveal--pending');
io.observe(n);
} else {
n.classList.add('is-in');
}
});
w.setTimeout(function () {
each(qsa('.reveal--pending'), function (n) {
var r = n.getBoundingClientRect();
if (r.top < vh && r.bottom > 0) { n.classList.remove('reveal--pending'); }
});
}, 3000);
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
d.addEventListener('click', function (e) {
var a = e.target && e.target.closest ? e.target.closest('a.anchor') : null;
if (!a || !w.navigator || !w.navigator.clipboard || !w.navigator.clipboard.writeText) { return; }
var url = w.location.origin + w.location.pathname + a.getAttribute('href');
w.navigator.clipboard.writeText(url).then(function () {
if (!note) {
note = el('div', 'copy-note', 'Link copied');
note.setAttribute('role', 'status');
}
d.body.appendChild(note);
w.clearTimeout(timer);
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
clear(view);
container.setAttribute('aria-busy', 'false');
var ul = el('ul', 'plans');
each(list, function (p) {
var li = el('li', 'plan');
li.appendChild(el('h' + level, 'plan__name', p.name));
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
a.setAttribute('aria-label', ctaLabel + ' with ' + p.name);
li.appendChild(a);
ul.appendChild(li);
});
view.appendChild(ul);
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
safe(initPrint);
ready(function () {
safe(initYear);
safe(initMenu);
safe(initHeader);
safe(initCurrentLink);
safe(initReveal);
safe(initToc);
safe(initAnchors);
safe(initOpenTarget);
safe(initFilter);
safe(initPlans);
safe(initTableFocus);
});
}(window, document));
