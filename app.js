// Katt Editing site script. Sections: work tabs, showreel, clip player, copy email, phone order bar, order form.
// Style tokens and component rules live in styles.css and DESIGN.md.

/* ---------- Work, grouped by type of work ---------- */
// Every piece here exists in the Drive "Portfolio Pieces" folder. A category with no piece
// shows an empty slot that asks for footage instead of filler.
const CATS = [
  { id: "motion", short: "Motion", name: "Motion design & animation", note: "Lesson graphics, transitions, logo stings" },
  { id: "clips", short: "Clips", name: "Podcast & creator clips", note: "Vertical clips for Shorts, Reels and TikTok" },
  { id: "ads", short: "Ads & demos", name: "Trailers, demos & ads", note: "Short promos for a course, product or app" },
  { id: "longform", short: "Long-form", name: "Long-form YouTube & gaming", note: "Full videos, cut for watch time" }
];
const WORK = [
  { id: "podcast", cat: "clips", fmt: "v", kind: "Podcast clip", title: "Two-host podcast",
    dur: "00:30", fps: "00:00:30:02" },
  { id: "sample", cat: "clips", fmt: "v", kind: "Promo", title: "Talking head with cutaways",
    dur: "00:32", fps: "00:00:31:24" },
  { id: "trailer", cat: "ads", fmt: "v", kind: "Course trailer", title: "Learn After Effects",
    dur: "00:33", fps: "00:00:32:21" },
  { id: "tutorial", cat: "motion", fmt: "v", kind: "Tutorial graphics", title: "Lesson opener",
    dur: "00:05", fps: "00:00:05:10" },
  { id: "transition", cat: "motion", fmt: "h", kind: "Motion design", title: "Lesson recap",
    dur: "00:13", fps: "00:00:13:00" },
  { id: "logo", cat: "motion", fmt: "h", kind: "Logo animation", title: "FurblowCraft logo sting",
    dur: "00:03", fps: "00:00:02:15" }
];
const EMPTY = {};

// Long-form pieces show as before/after: the same 60-90 second excerpt, raw and edited.
// To add a piece: put media/<id>-before.mp4 (raw), media/<id>-after.mp4 (the edit) and
// media/<id>.jpg (a frame from the edit) in media/, fill in kind and title, and set ready: true.
// One piece shows full width; two sit side by side; three: the first full width, two below.
const BEFORE_AFTER = [
  { id: "longform-1", ready: false, kind: "Long-form edit", title: "Long-form piece 1" },
  { id: "longform-2", ready: false, kind: "Long-form edit", title: "Long-form piece 2" },
  { id: "longform-3", ready: false, kind: "Long-form edit", title: "Long-form piece 3" }
];

const playIcon = '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z" fill="currentColor"/></svg>';
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function card(w) {
  const el = document.createElement("article");
  el.className = `card ${w.fmt === "v" ? "is-v" : "is-h"}`;
  el.innerHTML = `
    <button class="thumb" type="button" data-id="${w.id}" aria-label="Play ${w.title} with sound">
      <img src="media/${w.id}.jpg" alt="" loading="lazy">
      ${reduceMotion ? "" : `<video src="media/${w.id}-loop.mp4" muted loop playsinline preload="none" aria-hidden="true"></video>`}
      <span class="tag">${w.fmt === "v" ? "9:16" : "16:9"} · ${w.dur}</span>
      <span class="play">${playIcon}</span>
    </button>
    <div class="card-text">
      <span class="kind">${w.kind}</span>
      <h4>${w.title}</h4>
    </div>`;
  return el;
}
function emptyCard(e) {
  const el = document.createElement("article");
  el.className = `card empty ${e.fmt === "v" ? "is-v" : "is-h"}`;
  el.innerHTML = `
    <div class="slot"><p>${e.text}</p>
      <a class="btn btn-quiet" href="#order" data-need="${e.need}">Send footage</a></div>`;
  return el;
}

function baCard(b, n) {
  const el = document.createElement("article");
  el.className = "ba" + (b.ready ? "" : " ba-empty");
  const seg = `<div class="ba-seg" role="radiogroup" aria-label="Show raw footage or the edit">
      <button type="button" role="radio" aria-checked="false" data-v="before"${b.ready ? "" : " disabled"}>Before</button>
      <button type="button" role="radio" aria-checked="true" data-v="after"${b.ready ? "" : " disabled"}>After</button>
    </div>`;
  if (!b.ready) {
    el.innerHTML = `
      <div class="ba-frame ba-slot"><span class="ba-label">Slot ${n}</span>
        <p>Coming soon: raw footage next to my edit.</p></div>
      <div class="ba-bar"><div class="card-text"><span class="kind">${b.kind}</span><h4>${b.title}</h4></div>${seg}</div>`;
    return el;
  }
  el.innerHTML = `
    <div class="ba-frame">
      <video controls playsinline preload="none" poster="media/${b.id}.jpg" src="media/${b.id}-after.mp4" aria-label="${b.title}, edited version"></video>
      <span class="ba-label">After · edited</span>
    </div>
    <div class="ba-bar"><div class="card-text"><span class="kind">${b.kind}</span><h4>${b.title}</h4></div>${seg}</div>`;
  const v = el.querySelector("video"), label = el.querySelector(".ba-label");
  el.querySelector(".ba-seg").addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn || btn.getAttribute("aria-checked") === "true") return;
    const which = btn.dataset.v, t = v.currentTime, playing = !v.paused;
    el.querySelectorAll(".ba-seg button").forEach(x => x.setAttribute("aria-checked", String(x === btn)));
    label.textContent = which === "after" ? "After · edited" : "Before · raw";
    v.setAttribute("aria-label", `${b.title}, ${which === "after" ? "edited" : "raw"} version`);
    // Same moment in the other version, so the comparison is like for like
    v.addEventListener("loadedmetadata", () => {
      // Play only after the jump lands; calling play() first can cancel the seek
      if (playing) v.addEventListener("seeked", () => v.play().catch(() => {}), { once: true });
      v.currentTime = Math.min(t, v.duration || t);
    }, { once: true });
    v.preload = "auto"; // preload="none" would stop before metadata, so the jump to the same moment never fires
    v.src = `media/${b.id}-${which}.mp4`;
    v.load();
  });
  v.addEventListener("play", () => setSound(false));
  return el;
}

// Work tabs: one type of work on screen at a time (WAI-ARIA tabs pattern; arrow keys move between tabs)
const workRoot = document.getElementById("workPanels");
const tabList = document.getElementById("workTabs");
CATS.forEach((c, i) => {
  // Horizontal pieces first so 16:9 cards fill whole rows and 9:16 cards sit under them
  const items = WORK.filter(w => w.cat === c.id).sort((a, b) => (a.fmt === "h" ? 0 : 1) - (b.fmt === "h" ? 0 : 1));
  const panel = document.createElement("div");
  panel.className = "work-panel"; panel.id = `panel-${c.id}`; panel.dataset.cat = c.id;
  panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", `tab-${c.id}`);
  panel.hidden = i !== 0;
  if (c.id === "longform") {
    panel.innerHTML = `<div class="ba-grid"></div>`;
    BEFORE_AFTER.forEach((b, n) => panel.firstChild.appendChild(baCard(b, n + 1)));
    // Until a piece is ready, the slots sit in one short row instead of big empty 16:9 frames
    panel.firstChild.classList.toggle("all-empty", !BEFORE_AFTER.some(b => b.ready));
  } else {
    panel.innerHTML = `<div class="work-grid"></div>`;
    const grid = panel.querySelector(".work-grid");
    items.forEach(w => grid.appendChild(card(w)));
    if (!items.length && EMPTY[c.id]) grid.appendChild(emptyCard(EMPTY[c.id]));
  }
  workRoot.appendChild(panel);

  const t = document.createElement("button");
  t.type = "button"; t.className = "tab"; t.id = `tab-${c.id}`; t.textContent = c.short;
  t.setAttribute("role", "tab"); t.setAttribute("aria-controls", panel.id);
  t.setAttribute("aria-selected", String(i === 0)); t.tabIndex = i === 0 ? 0 : -1;
  tabList.appendChild(t);
});
function showTab(t, focus) {
  tabList.querySelectorAll(".tab").forEach(x => {
    const on = x === t;
    x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) t.focus();
  t.scrollIntoView({ block: "nearest", inline: "nearest" });
}
tabList.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) showTab(t); });
tabList.addEventListener("keydown", e => {
  const tabs = [...tabList.querySelectorAll(".tab")], i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault(); showTab(tabs[(to + tabs.length) % tabs.length], true);
});

// Preview loops play only while on screen
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); });
  }, { threshold: 0.35 });
  document.querySelectorAll(".thumb video").forEach(v => io.observe(v));
}

/* ---------- Showreel: muted autoplay, live SMPTE timecode, sound toggle ---------- */
const reel = document.getElementById("reel");
// Phones get a 640px reel (2 MB) instead of the 1280px one (6 MB)
reel.src = window.matchMedia("(max-width: 760px)").matches ? "media/showreel-sm.mp4" : "media/showreel.mp4";
const tc = document.getElementById("tc"), scrub = document.getElementById("scrub");
const pad = n => String(n).padStart(2, "0");
function smpte(t) {
  const f = Math.floor((t % 1) * 25), s = Math.floor(t);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}
function tick() {
  if (reel.duration) {
    tc.innerHTML = `<b>${smpte(reel.currentTime)}</b> / ${smpte(reel.duration)}`;
    scrub.style.width = (reel.currentTime / reel.duration * 100) + "%";
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
if (!reduceMotion) reel.play().catch(() => {});

// Sound fades in instead of starting at full level. Web Audio gain is used where possible
// because iPhones ignore video.volume; otherwise the element volume is ramped.
let audioCtx = null;
const gains = new WeakMap();
function gainFor(video) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    if (!audioCtx) audioCtx = new AC();
    if (!gains.has(video)) {
      const g = audioCtx.createGain();
      audioCtx.createMediaElementSource(video).connect(g).connect(audioCtx.destination);
      gains.set(video, g);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return gains.get(video);
  } catch (e) { return null; }
}
const ramps = new WeakMap();
function fadeIn(video, target, ms) {
  const g = gainFor(video);
  cancelAnimationFrame(ramps.get(video));
  if (g) {
    video.volume = 1;
    const now = audioCtx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(target, now + ms / 1000);
    return;
  }
  const start = performance.now();
  video.volume = 0;
  const step = t => {
    const k = Math.min(1, (t - start) / ms);
    video.volume = target * k * k;
    if (k < 1) ramps.set(video, requestAnimationFrame(step));
  };
  ramps.set(video, requestAnimationFrame(step));
}
const soundBtn = document.getElementById("soundBtn"), soundLabel = document.getElementById("soundLabel");
const iconMuted = document.getElementById("iconMuted"), iconSound = document.getElementById("iconSound");
const REEL_VOLUME = 0.6; // showreel plays a bit quieter than full volume (1 = 100%)
const FADE_MS = 1500;
function setSound(on) {
  if (on) fadeIn(reel, REEL_VOLUME, FADE_MS);
  reel.muted = !on;
  soundLabel.textContent = on ? "Sound on" : "Muted";
  iconMuted.hidden = on; iconSound.hidden = !on;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.setAttribute("aria-label", on ? "Showreel sound is on. Mute it" : "Showreel is muted. Turn sound on");
}
soundBtn.addEventListener("click", () => {
  if (reel.muted) { setSound(true); reel.currentTime = 0; reel.play().catch(() => {}); }
  else setSound(false);
});

/* ---------- Full clip player ---------- */
const dlg = document.getElementById("player"), pv = document.getElementById("playerVideo");
const pTitle = document.getElementById("playerTitle");
function openClip(id) {
  const w = WORK.find(x => x.id === id);
  setSound(false);
  pv.poster = `media/${id}.jpg`;
  pv.src = `media/${id}.mp4`;
  pTitle.textContent = `${w.kind} · ${w.fmt === "v" ? "9:16" : "16:9"} · ${w.fps}`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  fadeIn(pv, 1, 800);
  pv.play().catch(() => {});
}
function closeClip() { pv.pause(); pv.removeAttribute("src"); pv.load(); dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
document.querySelectorAll(".thumb").forEach(b => b.addEventListener("click", () => openClip(b.dataset.id)));
document.getElementById("closeBtn").addEventListener("click", closeClip);
dlg.addEventListener("click", e => { if (e.target === dlg) closeClip(); });
dlg.addEventListener("cancel", e => { e.preventDefault(); closeClip(); });

/* ---------- Copy email ---------- */
const copyBtn = document.getElementById("copyBtn"), copied = document.getElementById("copied");
copyBtn.addEventListener("click", () => {
  const text = document.getElementById("email").textContent;
  const done = () => { copied.textContent = "Copied"; setTimeout(() => copied.textContent = "", 2500); };
  const select = () => {
    const r = document.createRange(); r.selectNodeContents(document.getElementById("email"));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    copied.textContent = "Selected, press Ctrl+C";
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(select);
  else select();
});

/* ---------- Phone order bar: after the hero, hidden while the form is on screen ---------- */
const mbar = document.getElementById("mbar");
if ("IntersectionObserver" in window) {
  let pastHero = false, atForm = false;
  const sync = () => mbar.classList.toggle("show", pastHero && !atForm);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(document.querySelector(".hero .cta-row"));
  new IntersectionObserver(([e]) => { atForm = e.isIntersecting; sync(); }, { rootMargin: "0px 0px -20% 0px" }).observe(document.getElementById("order"));
}

/* ---------- Order form: one question per screen ---------- */
// Answers are sent through Web3Forms to katt.editing@gmail.com, same as the old form.
// Access key from web3forms.com (public by design; it only lets people send to this inbox).
// If sending fails, the last screen offers email instead.
const FORM_KEY = "20b02ff7-afcd-4a4c-a275-ee630797924b";
const MY_EMAIL = "katt.editing@gmail.com";

// Each question: id, title, optional hint, and options. An option can carry a price label,
// and "skip" lists questions that its answer makes pointless (a fixed-price package needs no budget).
const NEEDS = [
  { v: "longform", label: "A long-form YouTube or gaming edit", sub: "Full video, 16:9" },
  { v: "clips", label: "Short clips from my podcast or stream", sub: "Shorts, Reels, TikTok" },
  { v: "motion", label: "Motion graphics or animation", sub: "Trailer, lesson graphics, logo" },
  { v: "ads", label: "A product demo or ad", sub: "App, course or brand promo" },
  { v: "other", label: "Something else", sub: "Describe it on the next screen" }
];
const AMOUNTS = {
  clips: { title: "How many clips?", opts: [
    { v: "1 free sample clip", label: "1 free sample clip first", sub: "Pay nothing yet", skip: ["budget"] },
    { v: "Starter: 3 clips for $25", label: "3 clips", sub: "Starter · $25", skip: ["budget"] },
    { v: "Monthly: 12 clips for $79", label: "12 clips a month", sub: "Monthly · $79", skip: ["budget"] },
    { v: "Agency: batches at $8 per clip", label: "Ongoing batches for my clients", sub: "Agency · $8 a clip", skip: ["budget"] },
    { v: "Not sure yet", label: "Not sure yet" }
  ] },
  longform: { title: "How long is the finished video?", opts: [
    { v: "Under 10 minutes", label: "Under 10 minutes" }, { v: "10 to 20 minutes", label: "10 to 20 minutes" },
    { v: "20 to 40 minutes", label: "20 to 40 minutes" }, { v: "Over 40 minutes", label: "Over 40 minutes" },
    { v: "Not sure yet", label: "Not sure yet" }
  ] },
  motion: { title: "How long is the piece?", opts: [
    { v: "Under 15 seconds", label: "Under 15 seconds", sub: "Logo sting, intro" }, { v: "15 to 60 seconds", label: "15 to 60 seconds" },
    { v: "1 to 3 minutes", label: "1 to 3 minutes" }, { v: "A set of graphics", label: "A set of graphics", sub: "For a course or series" },
    { v: "Not sure yet", label: "Not sure yet" }
  ] },
  ads: { title: "How long is the video?", opts: [
    { v: "Under 30 seconds", label: "Under 30 seconds" }, { v: "30 to 60 seconds", label: "30 to 60 seconds" },
    { v: "1 to 3 minutes", label: "1 to 3 minutes" }, { v: "Not sure yet", label: "Not sure yet" }
  ] }
};
const STEPS = [
  { id: "need", title: "What do you need done?", opts: () => NEEDS },
  { id: "amount", title: () => (AMOUNTS[state.need] || {}).title, opts: () => (AMOUNTS[state.need] || {}).opts,
    text: () => state.need === "other" ? { title: "What do you need done?", hint: "One or two sentences.", ph: "A 60-second trailer for my course", max: 1000 } : null },
  { id: "deadline", title: "When do you need it?", opts: () => [
    { v: "Within 48 hours", label: "Within 48 hours" }, { v: "This week", label: "This week" },
    { v: "Within 2 weeks", label: "Within 2 weeks" }, { v: "No fixed date", label: "No fixed date" }
  ] },
  { id: "budget", title: "What's your budget?", hint: "US dollars. Rough is fine.", opts: () => [
    { v: "Under $25", label: "Under $25" }, { v: "$25 to $80", label: "$25 to $80" }, { v: "$80 to $200", label: "$80 to $200" },
    { v: "$200 to $500", label: "$200 to $500" }, { v: "Over $500", label: "Over $500" }, { v: "Not sure yet", label: "Not sure yet" }
  ] },
  { id: "link", title: "Got a link to the footage or your channel?", hint: "Optional.", link: true },
  { id: "contact", title: "Where should I reply?", hint: "I reply within a day.", contact: true }
];

const state = {};
let skipped = new Set();
let history = [];
let current = 0;

const ofForm = document.getElementById("orderForm");
const ofStage = document.getElementById("ofStage");
const ofBack = document.getElementById("ofBack");
const ofBar = document.getElementById("ofBar");
const ofCount = document.getElementById("ofCount");

function activeSteps() { return STEPS.filter(s => !skipped.has(s.id)); }
function stepIndex(id) { return activeSteps().findIndex(s => s.id === id); }
function nextIdFrom(i) {
  for (let j = i + 1; j < STEPS.length; j++) if (!skipped.has(STEPS[j].id)) return j;
  return -1;
}
function updateProgress() {
  const list = activeSteps(), pos = stepIndex(STEPS[current].id) + 1;
  ofCount.textContent = `${pos} / ${list.length}`;
  ofBar.style.width = `${(pos - 1) / list.length * 100 + 100 / list.length / 2}%`;
  ofBack.hidden = history.length === 0;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function render(dir) {
  const s = STEPS[current];
  const title = typeof s.title === "function" ? s.title() : s.title;
  const text = s.text && s.text();
  let body = "";
  if (text) {
    body = `<div class="of-field"><textarea id="of-text" rows="4" maxlength="${text.max}" placeholder="${esc(text.ph)}" aria-describedby="of-err">${esc(state.amount || "")}</textarea>
      <p class="of-err" id="of-err" role="alert"></p></div>
      <div class="of-actions"><button class="btn btn-primary" type="button" data-next>Next</button></div>`;
  } else if (s.opts) {
    body = `<div class="of-options" role="radiogroup" aria-labelledby="of-q">${s.opts().map((o, i) => `
      <button type="button" class="option" role="radio" aria-checked="${state[s.id] === o.v}" data-v="${esc(o.v)}" data-i="${i}">
        <span class="option-key mono" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
        <span class="option-text"><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ""}</span>
      </button>`).join("")}</div>`;
  } else if (s.link) {
    body = `<div class="of-field"><input id="of-link" type="url" inputmode="url" maxlength="500" autocomplete="url" placeholder="https://" value="${esc(state.link || "")}" aria-describedby="of-err">
      <p class="of-err" id="of-err" role="alert"></p></div>
      <div class="of-actions"><button class="btn btn-primary" type="button" data-next>Next</button><button class="btn btn-quiet" type="button" data-skip>Skip</button></div>`;
  } else if (s.contact) {
    const via = state.via || "email";
    body = `<div class="of-field"><label for="of-name">Your name</label>
        <input id="of-name" autocomplete="name" maxlength="100" value="${esc(state.name || "")}"></div>
      <div class="of-field"><span class="of-label" id="of-via-l">Reply by</span>
        <div class="seg" role="radiogroup" aria-labelledby="of-via-l">
          ${[["email", "Email"], ["instagram", "Instagram"], ["x", "X"]].map(([v, l]) => `<button type="button" role="radio" class="seg-btn" data-via="${v}" aria-checked="${via === v}">${l}</button>`).join("")}
        </div>
        <input id="of-reach" maxlength="254" aria-label="Your email or handle" value="${esc(state.reach || "")}">
      </div>
      <p class="of-err" id="of-err" role="alert"></p>
      <input class="hp" type="checkbox" id="of-bot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="of-actions"><button class="btn btn-primary" type="submit" id="of-send">Send request</button></div>
      <p class="of-note">Your answers go to my inbox and nowhere else. <a href="privacy.html">Privacy policy</a></p>`;
  }
  ofStage.innerHTML = `<div class="of-step ${dir ? "in-" + dir : ""}"><h3 id="of-q" tabindex="-1">${esc(title)}</h3>${(text ? text.hint : s.hint) ? `<p class="of-hint">${esc(text ? text.hint : s.hint)}</p>` : ""}${body}</div>`;
  updateProgress();
  if (s.contact) syncVia();
  const focusEl = ofStage.querySelector("textarea, input:not(.hp)") || ofStage.querySelector("#of-q");
  // On phones, don't pop the keyboard open on arrival; focus the question instead
  if (dir && focusEl) (window.matchMedia("(pointer: coarse)").matches ? ofStage.querySelector("#of-q") : focusEl).focus({ preventScroll: true });
}

function syncVia() {
  const via = state.via || "email", reach = document.getElementById("of-reach");
  ofStage.querySelectorAll(".seg-btn").forEach(b => b.setAttribute("aria-checked", String(b.dataset.via === via)));
  reach.type = via === "email" ? "email" : "text";
  reach.inputMode = via === "email" ? "email" : "text";
  reach.autocomplete = via === "email" ? "email" : "off";
  reach.placeholder = via === "email" ? "you@example.com" : "@yourhandle";
}

function go(toIndex, dir) {
  if (toIndex < 0) return;
  if (dir === "fwd") history.push(current);
  current = toIndex;
  render(dir);
}
function advance() { go(nextIdFrom(current), "fwd"); }

// Clean typed text: trim to limit and strip invisible control and text-direction characters
// that can disguise what a message or link says. Nothing typed is ever inserted as HTML.
function clean(v, max) {
  return v.normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g, "")
    .trim().slice(0, max);
}
function setErr(msg) { const e = document.getElementById("of-err"); if (e) e.textContent = msg; }

ofStage.addEventListener("click", e => {
  const s = STEPS[current];
  const opt = e.target.closest(".option");
  if (opt) {
    const o = s.opts()[+opt.dataset.i];
    if (s.id === "need" && state.need !== o.v) { delete state.amount; }
    state[s.id] = o.v;
    // Recompute which later questions apply
    skipped = new Set();
    const amt = state.need && AMOUNTS[state.need] && AMOUNTS[state.need].opts.find(x => x.v === state.amount);
    (amt && amt.skip || []).forEach(id => skipped.add(id));
    ofStage.querySelectorAll(".option").forEach(b => b.setAttribute("aria-checked", String(b === opt)));
    opt.classList.add("picked");
    setTimeout(advance, reduceMotion ? 0 : 220);
    return;
  }
  if (e.target.closest(".seg-btn")) { state.via = e.target.closest(".seg-btn").dataset.via; syncVia(); document.getElementById("of-reach").focus(); return; }
  if (e.target.closest("[data-skip]")) { state.link = ""; advance(); return; }
  if (e.target.closest("[data-next]")) {
    if (s.id === "amount") {
      const v = clean(document.getElementById("of-text").value, 1000);
      if (v.length < 10) { setErr("Describe what you need in a sentence or two."); return; }
      state.amount = v;
    }
    if (s.id === "link") {
      const v = clean(document.getElementById("of-link").value, 500);
      // Only plain web links: blocks javascript:, data: and other link types that run code
      if (v && !/^https?:\/\/[^\s<>"]+\.[^\s<>"]+$/i.test(v)) { setErr("Paste the full link, starting with https://"); return; }
      state.link = v;
    }
    advance();
  }
});
ofStage.addEventListener("input", e => {
  if (e.target.id === "of-name") state.name = e.target.value;
  if (e.target.id === "of-reach") state.reach = e.target.value;
  setErr("");
});
// Enter on a text step moves on; number/letter keys pick an option on desktop
ofStage.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "of-link") { e.preventDefault(); ofStage.querySelector("[data-next]").click(); }
});
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  if (!ofForm.contains(document.activeElement)) return;
  const k = e.key.toUpperCase();
  if (k.length === 1 && k >= "A" && k <= "F") {
    const b = ofStage.querySelector(`.option[data-i="${k.charCodeAt(0) - 65}"]`);
    if (b) { e.preventDefault(); b.click(); }
  }
});
ofBack.addEventListener("click", () => { if (history.length) { current = history.pop(); render("back"); } });

const needLabel = v => (NEEDS.find(n => n.v === v) || {}).label || v;
function summary(d) {
  return [
    `Name: ${d.name}`, `Reply by: ${d.reply_via} ${d.reply_to}`, `Needs: ${d.need}`, `Amount: ${d.amount}`,
    `Deadline: ${d.deadline}`, `Budget: ${d.budget}`, `Link: ${d.link || "(none)"}`
  ].join("\n");
}
function collect() {
  const via = state.via || "email";
  return {
    name: clean(state.name || "", 100),
    reply_via: { email: "Email", instagram: "Instagram", x: "X" }[via],
    reply_to: clean(state.reach || "", 254),
    need: needLabel(state.need),
    amount: state.amount || "",
    deadline: state.deadline || "",
    budget: skipped.has("budget") ? "Package price" : (state.budget || ""),
    link: state.link || ""
  };
}
function checkContact(d) {
  if (!d.name) return ["of-name", "Add your name so I know who to reply to."];
  if (state.via === "instagram" || state.via === "x") {
    if (!/^@?[A-Za-z0-9._]{1,30}$/.test(d.reply_to)) return ["of-reach", "Enter your handle, like @yourname."];
  } else if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(d.reply_to)) return ["of-reach", "Enter an email address like name@example.com."];
  return null;
}

ofForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (STEPS[current].id !== "contact") return;
  if (document.getElementById("of-bot").checked) return;
  const d = collect();
  const bad = checkContact(d);
  if (bad) { setErr(bad[1]); document.getElementById(bad[0]).focus(); return; }
  if (d.reply_via !== "Email" && !d.reply_to.startsWith("@")) d.reply_to = "@" + d.reply_to;
  const send = document.getElementById("of-send");
  send.disabled = true; send.textContent = "Sending...";
  const payload = {
    access_key: FORM_KEY, subject: `New request: ${d.need} · ${d.amount}`, from_name: "Katt Editing website", ...d
  };
  if (d.reply_via === "Email") payload.email = d.reply_to;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) { showSent(d); return; }
    showFallback(d);
  } catch (err) { showFallback(d); }
});

function showSent(d) {
  document.getElementById("ofTop").hidden = true;
  ofStage.innerHTML = `<div class="of-step of-done"><span class="done-mark" aria-hidden="true">${playIcon}</span><h3 tabindex="-1">Request sent</h3><p></p></div>`;
  ofStage.querySelector("p").textContent = d.reply_via === "Email"
    ? `Thanks, ${d.name}. I'll reply to ${d.reply_to} within a day.`
    : `Thanks, ${d.name}. I'll message ${d.reply_to} on ${d.reply_via} within a day.`;
  ofStage.querySelector("h3").focus();
}
function showFallback(d) {
  const send = document.getElementById("of-send");
  send.disabled = false; send.textContent = "Send request";
  const body = summary(d);
  setErr(`The form can't send right now. Email your answers to ${MY_EMAIL} instead.`);
  if (document.getElementById("of-fallback")) return;
  const box = document.createElement("div");
  box.className = "of-actions"; box.id = "of-fallback";
  box.innerHTML = `<a class="btn" href="mailto:${MY_EMAIL}?subject=${encodeURIComponent("Request: " + d.need)}&body=${encodeURIComponent(body)}">Open in my email app</a><button class="btn btn-quiet" type="button">Copy my answers</button>`;
  box.querySelector("button").onclick = () => { if (navigator.clipboard) navigator.clipboard.writeText(body).then(() => setErr(`Copied. Paste it into an email to ${MY_EMAIL}.`)).catch(() => {}); };
  send.parentNode.after(box);
}

// Buttons elsewhere on the page pre-answer the first questions, e.g. "Choose Starter"
// answers "clips" and "3 clips", then the form opens on the deadline question.
document.addEventListener("click", e => {
  const a = e.target.closest("[data-need]"); if (!a) return;
  state.need = a.dataset.need; history = [0]; skipped = new Set(); delete state.amount;
  let to = 1;
  if (a.dataset.amount) {
    state.amount = a.dataset.amount; history.push(1); to = 2;
    const o = (AMOUNTS[state.need].opts || []).find(x => x.v === state.amount);
    (o && o.skip || []).forEach(id => skipped.add(id));
  }
  current = to; render();
});

// Every link to #order lands on the form itself, not the heading above it
// (on phones the heading and email block would push the form below the fold).
document.addEventListener("click", e => {
  const a = e.target.closest('a[href="#order"]'); if (!a) return;
  e.preventDefault();
  const y = ofForm.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  if (location.hash !== "#order") history_replace("#order");
});
function history_replace(h) { try { window.history.replaceState(null, "", h); } catch (err) {} }

render();
