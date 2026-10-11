/* Follow ELMS: fills every [data-elms-social] / [data-elms-social-list] with the links set in the admin panel.
   Enhancement only: when anything fails the placeholders stay hidden and the page is left as it is. */
(function (w, d) {
  'use strict';
  if (w.ElmsSocial) return;

  var KEY = 'elmsSocialLinks';
  var SHOW_FOR = 24 * 60 * 60 * 1000; // a saved list this young is shown at once
  var ASK_AFTER = 5 * 60 * 1000;      // ...and the server is asked again once it is older than this
  var MAX_ITEMS = 12;
  var SVG = 'http://www.w3.org/2000/svg';

  // id: [label, glyph on a 24 x 24 grid]. Which site a link may lead to is decided by the server only: there is no copy of that list here.
  // for a platform the server knows and this file has no drawing for yet
  var GENERIC = 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z';
  var known = function (id) { return Object.prototype.hasOwnProperty.call(P, id); };

  var P = {
    instagram: ['Instagram',
      'M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6zm0 2a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H8zm4 2.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4zm0 2a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.4-3.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z'],
    facebook: ['Facebook',
      'M24 12.1c0-6.7-5.4-12-12-12s-12 5.3-12 12c0 6 4.4 10.9 10.1 11.8v-8.4h-3v-3.4h3v-2.7c0-3 1.8-4.6 4.6-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.6c-1.5 0-1.9 1-1.9 1.9v2.3h3.3l-.5 3.4h-2.8v8.4c5.7-.9 10.1-5.8 10.1-11.8z'],
    youtube: ['YouTube',
      'M6.5 4h11A4.5 4.5 0 0 1 22 8.5v7a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 15.5v-7A4.5 4.5 0 0 1 6.5 4zM10 8.6v6.8l5.8-3.4L10 8.6z'],
    x: ['X',
      'M18.9 1.2h3.7l-8.1 9.1 9.5 12.6h-7.4l-5.8-7.6-6.6 7.6h-3.7l8.6-9.9-9.1-11.8h7.6l5.2 6.9 6.1-6.9zm-1.3 19.5h2.1l-13.2-17.5h-2.2l13.3 17.5z'],
    tiktok: ['TikTok',
      'M12.5 0c1.3 0 2.6 0 3.9 0 .1 1.5.7 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4-.1-2.9-.4-4.2-1-.5-.2-1.1-.6-1.6-.9 0 2.9 0 5.8 0 8.7-.1 1.4-.5 2.8-1.4 4-1.3 1.9-3.5 3.2-5.9 3.2-1.4.1-2.8-.3-4-1-2.1-1.2-3.5-3.4-3.7-5.7 0-.5 0-1 0-1.5.2-1.9 1.1-3.8 2.6-5 1.6-1.4 4-2.1 6.1-1.7 0 1.5 0 2.9 0 4.4-1-.3-2.2-.2-3 .4-.7.4-1.1 1-1.4 1.7-.2.6-.1 1.1-.1 1.7.2 1.6 1.8 3 3.5 2.8 1.1 0 2.2-.6 2.7-1.6.2-.3.4-.7.4-1 .1-1.8.1-3.6.1-5.4 0-4 0-8.1 0-12.1z'],
    linkedin: ['LinkedIn',
      'M20.5 20.5h-3.6v-5.6c0-1.3 0-3.1-1.8-3.1-1.9 0-2.2 1.5-2.2 3v5.7h-3.5v-11.5h3.4v1.6h0c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zm-15.2-13.1a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zm1.8 13.1h-3.5v-11.5h3.5v11.5zm15.1-20.5h-20.4c-1 0-1.8.8-1.8 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7v-20.6c0-.9-.8-1.7-1.8-1.7z'],
    telegram: ['Telegram',
      'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5 7.2c.1 0 .3 0 .4.2.1.1.2.2.2.3 0 .1 0 .3 0 .5-.2 1.9-.9 6.5-1.3 8.6-.2.9-.5 1.2-.9 1.2-.7.1-1.2-.4-1.9-.9-1-.7-1.6-1.1-2.6-1.8-1.2-.8-.5-1.2.2-1.9.2-.2 3.3-3 3.3-3.2 0 0 0-.2 0-.2s-.2-.1-.3 0c-.1 0-1.8 1.1-5 3.3-.5.3-.9.5-1.3.5-.5 0-1.3-.3-1.9-.5-.8-.2-1.4-.3-1.3-.7 0-.3.3-.5.9-.7 3.5-1.5 5.8-2.5 7-3 3.3-1.4 4-1.6 4.5-1.7z'],
    whatsapp: ['WhatsApp channel',
      'M17.5 14.4c-.3-.2-1.8-.9-2.1-1s-.4-.1-.6.2-.8.9-1 1.1c-.1.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.1-.3 0-.5.2-.6.1-.2.3-.4.4-.6.2-.1.2-.3.3-.5.1-.2.1-.3 0-.5-.1-.1-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1.1 1-1.1 2.4s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.3 1.4.2 1.9.1.5 0 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4 0-.1-.2-.2-.5-.3m-5.4 7.4h-.1a9.9 9.9 0 0 1-5-1.4l-.3-.2-3.8 1 1-3.7-.2-.3a9.9 9.9 0 0 1-1.5-5.3c0-5.4 4.4-9.9 9.9-9.9 2.6 0 5.1 1.1 6.9 2.9a9.8 9.8 0 0 1 2.9 7c0 5.5-4.4 9.9-9.9 9.9m8.5-18.3a11.8 11.8 0 0 0-8.4-3.5c-6.6 0-11.9 5.3-11.9 11.9 0 2.1.5 4.1 1.6 5.9l-1.7 6.2 6.3-1.6a11.9 11.9 0 0 0 5.6 1.4h0c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z'],
    discord: ['Discord',
      'M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.1.1 0 0 0 0 0c-.3.4-.5.9-.6 1.2a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.7-1.2.1.1 0 0 0 0 0 19.7 19.7 0 0 0-4.9 1.5.1.1 0 0 0-.1 0c-3.1 4.7-3.9 9.2-3.5 13.7a.1.1 0 0 0 0 0 19.9 19.9 0 0 0 6 3.1.1.1 0 0 0 .1-.1c.5-.6.9-1.3 1.2-2a.1.1 0 0 0 0-.1 13 13 0 0 1-1.9-.9.1.1 0 0 1 0-.1l.4-.3a.1.1 0 0 1 .1 0c3.9 1.8 8.1 1.8 12 0a.1.1 0 0 1 .1 0c.1.1.2.2.4.3a.1.1 0 0 1 0 .1c-.6.4-1.3.7-1.9.9a.1.1 0 0 0-.1.1c.4.7.8 1.4 1.3 2a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 6-3 .1.1 0 0 0 0 0c.5-5.2-.9-9.7-3.6-13.7a.1.1 0 0 0 0 0zm-12.3 10.9c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4c1.2 0 2.2 1.1 2.2 2.4 0 1.3-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4c1.2 0 2.2 1.1 2.2 2.4 0 1.3-1 2.4-2.2 2.4z'],
    threads: ['Threads',
      'M12.2 24h0c-3.6 0-6.3-1.2-8.2-3.5-1.6-2.1-2.5-4.9-2.5-8.5v0c0-3.6.9-6.4 2.5-8.5 1.9-2.3 4.6-3.5 8.2-3.5h0c2.8 0 5 .7 6.8 2.1 1.7 1.3 2.9 3.1 3.5 5.5l-2 .5c-1.1-3.9-3.9-5.9-8.3-6-2.9 0-5.1 1-6.5 2.7-1.4 1.7-2.1 4.1-2.1 7.2 0 3.1.7 5.5 2.1 7.2 1.4 1.7 3.6 2.7 6.5 2.7 2.6 0 4.4-.6 5.8-2.1 1.6-1.6 1.6-3.6 1.1-4.8-.3-.7-.9-1.3-1.6-1.7-.2 1.3-.7 2.4-1.3 3.2-.9 1.2-2.2 1.7-3.8 1.8-1.2.1-2.3-.2-3.2-.8-1.1-.7-1.7-1.7-1.8-2.9 0-1.2.4-2.3 1.4-3.1.8-.8 2.1-1.2 3.5-1.3a13.9 13.9 0 0 1 3.1.1c-.2-.7-.4-1.3-.8-1.7-.5-.6-1.3-.9-2.3-.9h-.1c-.8 0-2 .2-2.7 1.3l-1.8-1.1c1-1.5 2.6-2.3 4.5-2.3h.1c3.1 0 5.1 2 5.2 5.4.2 0 .3.1.4.1 1.4.7 2.5 1.8 3.1 3.1.8 1.8.9 4.8-1.5 7.2-1.9 1.8-4.1 2.6-7.3 2.6zm1-11.7c-.2 0-.5 0-.7 0-1.9.1-3 1-3 2.2.1 1.2 1.5 1.8 2.8 1.7 1.2 0 2.8-.5 3.1-3.7a10.5 10.5 0 0 0-2.2-.2z']
  };

  // A link is used only when it is https, has no user name, password, port or fragment, a plain site name (not an address of numbers) and no query
  // (except a numeric Facebook profile id). Which site the link leads to was decided by the server. The address that is used is the parsed one.
  function safeUrl(id, url) {
    if (typeof url !== 'string' || url.length > 300) return '';
    if (!/^https:\/\/[\x21-\x7E]+$/.test(url) || /[\\<>"'`]/.test(url)) return '';
    var u;
    try { u = new URL(url); } catch (e) { return ''; }
    if (u.protocol !== 'https:' || u.username || u.password || u.port || u.hash) return '';
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(u.hostname) || /^[0-9.]+$/.test(u.hostname)) return '';
    if (u.search && !(id === 'facebook' && /^\?id=[0-9]{5,20}$/.test(u.search))) return '';
    return u.href;
  }

  function clean(list) {
    var out = [];
    var seen = Object.create(null);
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && out.length < MAX_ITEMS; i++) {
      var it = list[i];
      if (!it || typeof it !== 'object' || typeof it.id !== 'string' || !/^[a-z][a-z0-9_-]{0,23}$/.test(it.id) || seen[it.id]) continue;
      var href = safeUrl(it.id, it.url);
      if (!href) continue;
      var label = typeof it.label === 'string' ? it.label.replace(/\s+/g, ' ').trim() : '';
      var shown = /^[\w .+-]{1,40}$/.test(label) ? label : (known(it.id) ? P[it.id][0] : '');
      if (!shown) continue;
      seen[it.id] = 1;
      out.push({ id: it.id, label: shown, url: href });
    }
    return out;
  }

  function glyph(id) {
    if (typeof id !== 'string') return null;
    var svg = d.createElementNS(SVG, 'svg');
    var path = d.createElementNS(SVG, 'path');
    var at = { viewBox: '0 0 24 24', width: '20', height: '20', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' };
    for (var k in at) svg.setAttribute(k, at[k]);
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', known(id) ? P[id][1] : GENERIC);
    svg.appendChild(path);
    return svg;
  }

  // Draws the links into box and returns how many were drawn. variant: row (icons), band (icons with names), sidebar (small icons).
  function render(box, links, variant) {
    if (!box) return 0;
    while (box.firstChild) box.removeChild(box.firstChild);
    var list = clean(links);
    if (!list.length) return 0;
    var ul = d.createElement('ul');
    ul.className = 'elms-social elms-social--' + (variant === 'band' || variant === 'sidebar' ? variant : 'row');
    ul.setAttribute('aria-label', 'ELMS on social media');
    for (var i = 0; i < list.length; i++) {
      var li = d.createElement('li');
      var a = d.createElement('a');
      a.href = list[i].url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', 'ELMS on ' + list[i].label + ' (opens in a new tab)');
      a.appendChild(glyph(list[i].id));
      var name = d.createElement('span');
      name.className = 'elms-social__label';
      name.textContent = list[i].label;
      a.appendChild(name);
      li.appendChild(a);
      ul.appendChild(li);
    }
    box.appendChild(ul);
    return list.length;
  }

  function paint(links) {
    var holders = d.querySelectorAll('[data-elms-social]');
    var band = !!d.querySelector('[data-elms-social="band"]');
    var i;
    for (i = 0; i < holders.length; i++) {
      var holder = holders[i];
      var variant = holder.getAttribute('data-elms-social') || 'row';
      var target = holder.querySelector('[data-elms-social-list]') || holder;
      // a page with a band does not show the same list again in its footer
      holder.hidden = render(target, variant === 'row' && band ? [] : links, variant) === 0;
    }
    var lone = d.querySelectorAll('[data-elms-social-list]');
    for (i = 0; i < lone.length; i++) {
      if (lone[i].closest && lone[i].closest('[data-elms-social]')) continue;
      lone[i].hidden = !render(lone[i], links, 'band');
    }
  }

  var shown = null;
  function show(links) {
    var key = JSON.stringify(links);
    if (key === shown) return;
    shown = key;
    paint(links);
  }

  function readSaved() {
    try {
      var saved = JSON.parse(w.localStorage.getItem(KEY));
      if (saved && typeof saved.at === 'number' && Array.isArray(saved.links)) return { at: saved.at, links: clean(saved.links) };
    } catch (e) { /* storage blocked or unreadable: the page works without it */ }
    return null;
  }

  function keep(links) {
    try { w.localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), links: links })); } catch (e) { /* storage blocked: nothing is kept */ }
  }

  // Only a clear answer changes anything: a missing route, an error, a timeout or an unreadable answer leaves the page as it is.
  function ask(fresh) {
    var api = w.ELMS_API;
    if (typeof api !== 'string' || typeof w.fetch !== 'function') return;
    var ctl = typeof w.AbortController === 'function' ? new w.AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    var init = { credentials: 'omit', cache: fresh ? 'reload' : 'default' };
    if (ctl) init.signal = ctl.signal;
    w.fetch(api + '/api/social-links', init).then(function (r) {
      if (!r.ok) throw new Error('no');
      return r.json();
    }).then(function (j) {
      clearTimeout(timer);
      if (!j || j.success !== true || !Array.isArray(j.links)) return;
      var links = clean(j.links);
      keep(links);
      show(links);
    }).catch(function () { clearTimeout(timer); });
  }

  function start() {
    try {
      var saved = readSaved();
      var age = saved ? Date.now() - saved.at : Infinity;
      // a list stamped in the future (a wrong clock, a hand-edited value) counts as old: it is not shown and the server is asked
      if (saved && age >= 0 && age < SHOW_FOR) show(saved.links);
      if (!saved || age < 0 || age >= ASK_AFTER) ask(false);
    } catch (e) { /* the page is not held up */ }
  }

  w.ElmsSocial = {
    render: function (box, links, variant) { try { return render(box, links, variant); } catch (e) { return 0; } },
    glyph: function (id) { try { return glyph(id); } catch (e) { return null; } },
    reload: function () { try { ask(true); } catch (e) { /* the next page view asks again */ } }
  };

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})(window, document);
