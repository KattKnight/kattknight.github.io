// Katt Editing site script. Sections: work tabs, showreel, clip player, copy email, phone order bar, order form.
// Style tokens and component rules live in styles.css and DESIGN.md.

/* ---------- Work, grouped by type of work ---------- */
// Every piece here exists in the Drive "Portfolio Pieces" folder. A category with no piece
// shows an empty slot that asks for footage instead of filler.
const CATS = [
  { id: "motion", short: "Motion", name: "Motion design & animation", note: "Lesson graphics, transitions, logo stings" },
  { id: "clips", short: "Clips", name: "Podcast & creator clips", note: "Vertical clips for Shorts, Reels and TikTok" },
  { id: "ads", short: "Ads & demos", name: "Trailers, demos & ads", note: "Short promos for a course, product or app" },
  { id: "longform", short: "Long-form", name: "Long-form videos", note: "Full videos, cut for watch time" }
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
    <button class="thumb" type="button" data-id="${w.id}" aria-label="Play ${esc(w.title)} with sound">
      <img src="media/${w.id}.jpg" alt="" loading="lazy">
      ${reduceMotion ? "" : `<video src="media/${w.id}-loop.mp4" muted loop playsinline preload="none" aria-hidden="true"></video>`}
      <span class="tag">${w.fmt === "v" ? "9:16" : "16:9"} · ${w.dur}</span>
      <span class="play">${playIcon}</span>
    </button>
    <div class="card-text">
      <span class="kind">${esc(w.kind)}</span>
      <h4>${esc(w.title)}</h4>
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
      <div class="ba-bar"><div class="card-text"><span class="kind">${esc(b.kind)}</span><h4>${esc(b.title)}</h4></div>${seg}</div>`;
    return el;
  }
  el.innerHTML = `
    <div class="ba-frame">
      <video controls playsinline preload="none" poster="media/${b.id}.jpg" src="media/${b.id}-after.mp4" aria-label="${esc(b.title)}, edited version"></video>
      <span class="ba-label">After · edited</span>
    </div>
    <div class="ba-bar"><div class="card-text"><span class="kind">${esc(b.kind)}</span><h4>${esc(b.title)}</h4></div>${seg}</div>`;
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

// Pricing tabs: Clips | Long-form
const priceTabs = document.getElementById("priceTabs");
function showPriceTab(t, focus) {
  priceTabs.querySelectorAll(".tab").forEach(x => {
    const on = x === t;
    x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) t.focus();
}
priceTabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) showPriceTab(t); });
priceTabs.addEventListener("keydown", e => {
  const tabs = [...priceTabs.querySelectorAll(".tab")], i = tabs.indexOf(document.activeElement);
  if (i < 0 || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
  e.preventDefault(); showPriceTab(tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length], true);
});

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

// Quiet load: the poster sits behind the video (CSS), and the video fades in once frames are playing.
// Headline, text and reel ease in once, a tenth of a second apart. One motion, nothing that asks for attention.
const showReel = () => reel.classList.add("ready");
if (reduceMotion) showReel(); else reel.addEventListener("playing", showReel, { once: true });
setTimeout(showReel, 4000); // never leave the frame on the poster forever (slow network, autoplay blocked)
document.querySelectorAll(".hero .q-in").forEach((el, i) => setTimeout(() => el.classList.add("on"), reduceMotion ? 0 : 80 + i * 100));

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
// Volume starts at 30% of the target (audible straight away, not a jump from silence) and rises
// to the target along an S-curve: slow start, quicker middle, gentle landing.
const FADE_FROM = 0.3;
const sCurve = k => 0.5 - 0.5 * Math.cos(Math.PI * k); // 0 → 1, eased at both ends
function fadeIn(video, target, ms) {
  const g = gainFor(video);
  cancelAnimationFrame(ramps.get(video));
  const level = k => target * (FADE_FROM + (1 - FADE_FROM) * sCurve(k));
  if (g) {
    video.volume = 1;
    const now = audioCtx.currentTime;
    const curve = new Float32Array(64).map((_, i) => level(i / 63));
    g.gain.cancelScheduledValues(now);
    g.gain.setValueCurveAtTime(curve, now, ms / 1000);
    return;
  }
  const start = performance.now();
  video.volume = level(0);
  const step = t => {
    const k = Math.min(1, (t - start) / ms);
    video.volume = level(k);
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
  // The button names what it does: "Play with sound" restarts the reel with sound, "Mute" turns it off
  soundLabel.textContent = on ? "Mute" : "Play with sound";
  iconMuted.hidden = on; iconSound.hidden = !on;
  soundBtn.setAttribute("aria-pressed", String(on));
}
// Clicking the reel itself does the same as the button
document.querySelector(".hero .viewer-frame").addEventListener("click", e => { if (!e.target.closest("button")) soundBtn.click(); });
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
  { v: "longform", label: "A long-form video edit", sub: "YouTube, podcast, course, 16:9" },
  { v: "clips", label: "Short clips from my podcast or stream", sub: "Shorts, Reels, TikTok" },
  { v: "motion", label: "Motion graphics or animation", sub: "Trailer, lesson graphics, logo" },
  { v: "ads", label: "A product demo or ad", sub: "App, course or brand promo" },
  { v: "other", label: "Something else", sub: "Describe it on the next screen" }
];
const AMOUNTS = {
  clips: { title: "How many clips?", opts: [
    { v: "1 free sample clip", label: "1 free sample clip first", sub: "Pay nothing yet", skip: ["budget"] },
    { v: "Try: 3 clips for $39", label: "3 clips", sub: "Try · $39", skip: ["budget"] },
    { v: "Clips Monthly: 12 clips a month for $99", label: "12 clips a month", sub: "Monthly · $99", skip: ["budget"] },
    { v: "Daily: 30 clips a month for $219", label: "30 clips a month", sub: "Daily · $219", skip: ["budget"] },
    { v: "Agency: white-label from $8 a clip or $79 a video", label: "White-label work for my clients", sub: "Agency · from $8 a clip", skip: ["budget"] },
    { v: "Not sure yet", label: "Not sure yet" }
  ] },
  longform: { title: "How many videos?", opts: [
    { v: "1 free sample edit", label: "A free sample first", sub: "I edit a short part of one video", skip: ["budget", "length", "thumbs"] },
    { v: "Single: 1 video for $99", label: "1 video", sub: "Single · $99", skip: ["budget"] },
    { v: "Long-form Monthly: 4 videos + 8 clips a month for $349", label: "4 videos + 8 clips a month", sub: "Monthly · $349", skip: ["budget"] },
    { v: "Channel: 8 videos + 16 clips + 8 thumbnails a month for $699", label: "8 videos + 16 clips a month", sub: "Channel · $699, thumbnails included", skip: ["budget", "thumbs"] },
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
  { id: "length", title: "How long is each finished video?", hint: "Agreed before I start, so the price is fixed.", opts: () => [
    { v: "Up to 20 minutes", label: "Up to 20 minutes", sub: "Base price" },
    { v: "21 to 30 minutes", label: "21 to 30 minutes", sub: "+$50 a video" },
    { v: "Over 30 minutes", label: "Over 30 minutes", sub: "Quoted" },
    { v: "Not sure yet", label: "Not sure yet" }
  ] },
  { id: "thumbs", title: "Want thumbnails too?", hint: "Each comes with an A/B variant for YouTube's Test & Compare.", opts: () => [
    { v: "Yes, one per video", label: "Yes, one per video", sub: "$19 each, or $59 for 4" },
    { v: "Yes, with a second concept", label: "Yes, with a second concept", sub: "+$10 per video" },
    { v: "No thanks", label: "No thanks" }
  ] },
  { id: "deadline", title: "When do you need it?", opts: () => [
    { v: "Within 48 hours", label: "Within 48 hours" }, { v: "This week", label: "This week" },
    { v: "Within 2 weeks", label: "Within 2 weeks" }, { v: "No fixed date", label: "No fixed date" }
  ] },
  { id: "budget", title: "What's your budget?", hint: "US dollars. Rough is fine.", opts: () => [
    { v: "Under $40", label: "Under $40" }, { v: "$40 to $100", label: "$40 to $100" }, { v: "$100 to $350", label: "$100 to $350" },
    { v: "$350 to $650", label: "$350 to $650" }, { v: "Over $650", label: "Over $650" }, { v: "Not sure yet", label: "Not sure yet" }
  ] },
  { id: "link", title: "Got a link to the footage or your channel?", hint: "Optional.", link: true },
  { id: "contact", title: "Where should I reply?", hint: "I reply within a day.", contact: true }
];

const state = {};
// The length question only applies to long-form orders (it sets the price band)
function baseSkips() { return new Set(state.need === "longform" ? [] : ["length", "thumbs"]); }
let skipped = new Set(["length", "thumbs"]);
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
// Escapes text for HTML. A function declaration (hoisted) so the work cards, built earlier in this file, can use it too.
function esc(t) { return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function stepMarkup(s, dir) {
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
        <div class="seg" role="radiogroup" aria-labelledby="of-via-l"><span class="seg-pill" aria-hidden="true"></span>
          ${[["email", "Email"], ["instagram", "Instagram"], ["x", "X"]].map(([v, l]) => `<button type="button" role="radio" class="seg-btn" data-via="${v}" aria-checked="${via === v}">${l}</button>`).join("")}
        </div>
        <input id="of-reach" maxlength="254" aria-label="Your email or handle" value="${esc(state.reach || "")}">
      </div>
      <p class="of-err" id="of-err" role="alert"></p>
      <input class="hp" type="checkbox" id="of-bot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="of-actions"><button class="btn btn-primary" type="submit" id="of-send">Send request</button></div>
      <p class="of-note">Your answers go to my inbox and nowhere else. <a href="privacy.html">Privacy policy</a></p>`;
  }
  return `<div class="of-step ${dir ? "in-" + dir : ""}"><h3 id="of-q" tabindex="-1">${esc(title)}</h3>${(text ? text.hint : s.hint) ? `<p class="of-hint">${esc(text ? text.hint : s.hint)}</p>` : ""}${body}</div>`;
}

function render(dir) {
  const s = STEPS[current];
  ofStage.innerHTML = stepMarkup(s, dir);
  sizeTiles();
  advancing = false;
  updateProgress();
  if (s.contact) syncVia(true);
  const focusEl = ofStage.querySelector("textarea, input:not(.hp)") || ofStage.querySelector("#of-q");
  // On phones, don't pop the keyboard open on arrival; focus the question instead
  if (dir && focusEl) (window.matchMedia("(pointer: coarse)").matches ? ofStage.querySelector("#of-q") : focusEl).focus({ preventScroll: true });
}

// One fixed height for every question: each one is laid out in a hidden copy of the card at the
// current width (every answer list, with an error line showing), and the card takes the tallest.
// Nothing below the form moves while someone answers. Re-measured when the width changes.
function fitStage() {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.className = "of-stage";                                // same layout rules as the real card
  probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;width:${ofStage.clientWidth}px`;
  ofStage.parentNode.appendChild(probe);
  const saved = state.need;
  let tallest = 0;
  for (const need of [undefined, ...NEEDS.map(n => n.v)]) {
    state.need = need;
    for (const st of STEPS) {
      if (st.id === "amount" && !need) continue;
      probe.innerHTML = stepMarkup(st);
      probe.querySelectorAll(".of-err").forEach(e => { e.textContent = "Enter an email address, like you@example.com."; });
      tallest = Math.max(tallest, probe.offsetHeight);
    }
  }
  state.need = saved;
  probe.remove();
  if (tallest) ofStage.style.minHeight = tallest + "px";
}
// Answer text is sized by eye to its tile: about a fifth of the tile height, 16 to 20 px, and never more
// than 55% of the question's size, so the question always reads as the heading. If a label would
// overflow its tile, it steps down until it fits, so the card never grows.
function sizeTiles() {
  const tiles = [...ofStage.querySelectorAll(".option")];
  ofStage.style.setProperty("--fs", "16px");
  if (!tiles.length) return;
  const limit = parseFloat(ofStage.style.minHeight) || ofStage.offsetHeight;
  const q = ofStage.querySelector("#of-q");
  const cap = Math.min(20, q ? parseFloat(getComputedStyle(q).fontSize) * 0.55 : 20);
  let fs = Math.round(Math.max(16, Math.min(cap, tiles[0].getBoundingClientRect().height * 0.2)));
  const fits = () => ofStage.offsetHeight <= limit + 1 && tiles.every(t => t.scrollHeight <= t.clientHeight + 1);
  ofStage.style.setProperty("--fs", fs + "px");
  while (fs > 16 && !fits()) { fs--; ofStage.style.setProperty("--fs", fs + "px"); }
}
let fitWidth = 0;
const refit = () => { if (ofStage.clientWidth !== fitWidth) { fitWidth = ofStage.clientWidth; fitStage(); sizeTiles(); } };
refit();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitWidth = 0; refit(); });
addEventListener("resize", () => { clearTimeout(refit.t); refit.t = setTimeout(refit, 150); });
let advancing = false;

// Reply-by switch: one pill sits on the chosen option and slides only when another one is chosen.
// Hovering just brightens the label, so the pill always matches what the box below asks for.
function movePill(btn, instant) {
  const seg = btn && btn.closest(".seg"); if (!seg) return;
  const pill = seg.querySelector(".seg-pill");
  if (instant) pill.style.transition = "none";
  pill.style.width = btn.offsetWidth + "px";
  pill.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  seg.querySelectorAll(".seg-btn").forEach(b => b.classList.toggle("lit", b === btn));
  if (instant) { void pill.offsetWidth; pill.style.transition = ""; }
}
const chosenSeg = () => ofStage.querySelector('.seg-btn[aria-checked="true"]');

function syncVia(first) {
  const via = state.via || "email", reach = document.getElementById("of-reach");
  ofStage.querySelectorAll(".seg-btn").forEach(b => b.setAttribute("aria-checked", String(b.dataset.via === via)));
  movePill(chosenSeg(), first);
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
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, "")
    .trim().slice(0, max);
}
function setErr(msg) { const e = document.getElementById("of-err"); if (e) e.textContent = msg; }

// Instant feedback: an answer lights up the moment it's pressed, not when the finger lifts
ofStage.addEventListener("pointerdown", e => { const o = e.target.closest(".option"); if (o) o.classList.add("pressing"); });
["pointerup", "pointerleave", "pointercancel"].forEach(t => ofStage.addEventListener(t, e => {
  const o = e.target.closest && e.target.closest(".option"); if (o) o.classList.remove("pressing");
}, true));

ofStage.addEventListener("click", e => {
  const s = STEPS[current];
  const opt = e.target.closest(".option");
  if (opt) {
    const o = s.opts()[+opt.dataset.i];
    if (s.id === "need" && state.need !== o.v) { delete state.amount; }
    state[s.id] = o.v;
    // Recompute which later questions apply
    skipped = baseSkips();
    const amt = state.need && AMOUNTS[state.need] && AMOUNTS[state.need].opts.find(x => x.v === state.amount);
    (amt && amt.skip || []).forEach(id => skipped.add(id));
    if (advancing) return;                                     // a quick double tap can't skip a question
    advancing = true;
    ofStage.querySelectorAll(".option").forEach(b => b.setAttribute("aria-checked", String(b === opt)));
    opt.classList.add("picked");
    setTimeout(advance, reduceMotion ? 0 : 120);               // just long enough to see the pick
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
    `Length: ${d.length || "(n/a)"}`, `Thumbnails: ${d.thumbnails || "(n/a)"}`, `Deadline: ${d.deadline}`, `Budget: ${d.budget}`, `Link: ${d.link || "(none)"}`
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
    length: skipped.has("length") ? "" : (state.length || ""),
    thumbnails: state.amount && state.amount.startsWith("Channel") ? "Included" : (skipped.has("thumbs") ? "" : (state.thumbs || "")),
    deadline: state.deadline || "",
    budget: skipped.has("budget") ? "Package price" : (state.budget || ""),
    link: state.link || ""
  };
}
function checkContact(d) {
  if (!d.name) return ["of-name", "Add your name so I know who to reply to."];
  if (state.via === "instagram" || state.via === "x") {
    if (!/^@?[A-Za-z0-9._]{1,30}$/.test(d.reply_to)) return ["of-reach", "Enter your handle, like @yourhandle."];
  } else if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(d.reply_to)) return ["of-reach", "Enter an email address, like you@example.com."];
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
    access_key: FORM_KEY, subject: `New request: ${d.need} · ${d.amount}`.replace(/\s+/g, " ").slice(0, 80),
    from_name: "Katt Editing website", botcheck: false, ...d
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
  state.need = a.dataset.need; history = [0]; skipped = baseSkips(); delete state.amount;
  let to = 1;
  if (a.dataset.amount) {
    state.amount = a.dataset.amount; history.push(1);
    const o = (AMOUNTS[state.need].opts || []).find(x => x.v === state.amount);
    (o && o.skip || []).forEach(id => skipped.add(id));
    // The next question that applies (clip orders skip the video-length question)
    to = nextIdFrom(1);
  }
  current = to; render();
});

// In-page links (#work, #pricing, #faq, #order, #top) scroll without writing the #part into the
// address bar, so the URL stays kattknight.github.io/. Links to #order land on the form itself,
// not the heading above it (on phones the heading would push the form below the fold).
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute("href").slice(1);
  const target = id === "order" ? ofForm : id === "top" || !id ? document.body : document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const y = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  cleanUrl();
});
// Old links like /index.html#pricing still scroll to their section, then the URL is tidied to /
function cleanUrl() {
  const clean = location.pathname.replace(/index\.html$/, "") + location.search;
  if (clean !== location.pathname + location.search + location.hash) {
    try { window.history.replaceState(null, "", clean); } catch (err) {}
  }
}
window.addEventListener("load", () => setTimeout(cleanUrl, 300));

/* ---------- Rubber-band overscroll (mouse wheel and trackpads on Windows, Linux, ChromeOS) ----------
   Modelled on Android's OverScrollDecor (the "iOS-like overscroll" Ayan picked): past the top or
   bottom the page follows the scroll at a third of its distance, up to about 15% of the screen
   height, then 70 ms after the last scroll step it comes straight back with a decelerate curve
   (fast first, soft landing): 200 ms for small pulls, up to ~400 ms for big ones. No overshoot.
   A wheel notch is smoothed over ~30 ms so it doesn't teleport. Apple devices bounce natively and
   touch screens have their own effect, so this only runs for wheel input elsewhere. The header and
   footer stay put; only the content between them moves. */
(function rubberBand() {
  const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (apple || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
  const layers = [document.querySelector("main")];               // the footer stays anchored
  const RATIO = 3;            // page moves 1/3 of the scroll distance (OverScrollDecor's drag ratio)
  const REACH = 0.15;         // furthest pull: 15% of the window height
  const SMOOTH = 30;          // ms: how quickly the page catches up with the scroll
  const RELEASE = 70;         // ms without scrolling before it comes back
  const MIN_BACK = 200, MAX_BACK = 800;                          // bounce-back time scales with the pull
  const decelerate = t => 1 - (1 - t) * (1 - t);
  let x = 0, target = 0, back = null, raf = 0, timer = 0, release = 0, last = 0, running = false;
  // Trackpads keep sending a "momentum" tail of shrinking scroll steps after the fingers lift.
  // Once the steps shrink twice in a row (or one gesture has held for 450 ms), the gesture counts as
  // over: the page comes back straight away and the rest of the tail is ignored.
  // The hold timer and momentum check start when a gesture REACHES the edge (most swipes start further
  // down the page). If the page arrives at the edge already coasting on momentum, it gets a short
  // impact bounce sized to its speed, like iOS, instead of nothing.
  let edgeStart = 0, lastWheel = 0, prevStep = 0, shrinking = 0, spent = false, wasAtEdge = false;
  const GAP = 150, MAX_HOLD = 450;

  const limit = () => innerHeight * REACH;
  const draw = () => {
    const t = Math.abs(x) < 0.05 ? "" : `translate3d(0, ${x.toFixed(2)}px, 0)`;
    for (const el of layers) el.style.transform = t;
  };
  function schedule() {
    raf = requestAnimationFrame(tick);
    timer = setTimeout(() => { cancelAnimationFrame(raf); tick(); }, 40);   // backup if frames stall
  }
  function tick() {
    clearTimeout(timer);
    const now = performance.now(), dt = Math.min(48, Math.max(1, now - last)); last = now;
    if (back) {
      const k = Math.min(1, (now - back.start) / back.ms);
      x = back.from * (1 - decelerate(k));
      if (k >= 1) { x = 0; target = 0; back = null; draw(); running = false; return; }
    } else {
      x += (target - x) * (1 - Math.exp(-dt / SMOOTH));            // follow the scroll, smoothed
    }
    draw();
    schedule();
  }
  function start() { if (!running) { running = true; last = performance.now(); schedule(); } }
  function comeBack() {
    clearTimeout(release);
    if (back || !x && !target) return;
    back = { from: x, start: performance.now(), ms: Math.min(MAX_BACK, Math.max(MIN_BACK, Math.abs(x) / innerHeight * MAX_BACK * 2)) };
    start();
  }

  addEventListener("wheel", e => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.target.closest && e.target.closest("dialog, textarea, .tabs"))) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;        // lines → px for some mice
    const now = performance.now();
    const newGesture = now - lastWheel > GAP;
    lastWheel = now;
    const step = Math.abs(dy);
    shrinking = newGesture ? 0 : (step < prevStep ? shrinking + 1 : 0);
    prevStep = step;
    const max = document.documentElement.scrollHeight - innerHeight;
    const atTop = scrollY <= 1 && dy < 0, atBottom = scrollY >= max - 2 && dy > 0;
    if (!atTop && !atBottom) { wasAtEdge = false; return; }
    if (newGesture || !wasAtEdge) {                                  // this gesture just reached the edge
      wasAtEdge = true; edgeStart = now; spent = false;
      if (shrinking >= 1 && !newGesture) {                           // arrived coasting: impact bounce
        spent = true;
        if (back) back = null;
        const L = limit();
        target = Math.max(-L, Math.min(L, Math.sign(-dy) * Math.min(L, step * 1.2)));
        clearTimeout(release); release = setTimeout(comeBack, 90);
        start();
        return;
      }
      shrinking = 0;
    }
    if (spent) return;                                               // rest of a momentum tail: ignore
    if (shrinking >= 2 || now - edgeStart > MAX_HOLD) { spent = true; comeBack(); return; }
    if (back) { target = x; back = null; }                           // caught mid-return: carry on from here
    const L = limit();
    const room = 1 - Math.min(1, Math.abs(target) / L);              // soft stop as it nears the limit
    target = Math.max(-L, Math.min(L, target - (dy / RATIO) * room));
    clearTimeout(release);
    release = setTimeout(comeBack, RELEASE);
    start();
  }, { passive: true });
})();

render();
