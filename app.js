const WORK = [
  { id: "podcast", fmt: "v", kind: "Podcast clip", title: "Two-host podcast, cut to 30 seconds",
    dur: "00:30", fps: "00:00:30:02",
    text: "Pinned hook bar, stacked speaker layout, a bullet-point explainer card and b-roll of each product they mention." },
  { id: "sample", fmt: "v", kind: "Talking-head promo", title: "Promo with rapid-fire cutaways",
    dur: "00:32", fps: "00:00:31:24",
    text: "Word-by-word captions with the key word in colour, and an archive cutaway on every name the speaker drops." },
  { id: "trailer", fmt: "v", kind: "Course trailer", title: "Learn After Effects, 25-lesson trailer",
    dur: "00:33", fps: "00:00:32:21",
    text: "Kinetic type, a running lesson counter and a level-by-level tour of the curriculum, all built in After Effects." },
  { id: "tutorial", fmt: "v", kind: "Tutorial graphics", title: "Lesson opener: The Interface",
    dur: "00:05", fps: "00:00:05:10",
    text: "Parchment lesson card with an annotated screenshot that circles the canvas and timeline." },
  { id: "transition", fmt: "h", kind: "Course motion design", title: "Lesson recap and transition",
    dur: "00:13", fps: "00:00:13:00",
    text: "Animated recap checklist that hands off to the next lesson's title card." },
  { id: "logo", fmt: "h", kind: "Logo animation", title: "Logo sting for a home-goods brand",
    dur: "00:03", fps: "00:00:02:15",
    text: "The mark draws on first, then the name and tagline. Sized for intros and outros." }
];

const playIcon = '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z" fill="#1A1400"/></svg>';
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function card(w) {
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <button class="thumb" type="button" data-id="${w.id}" aria-label="Play ${w.title} with sound">
      <img src="media/${w.id}.jpg" alt="" loading="lazy">
      ${reduceMotion ? "" : `<video src="media/${w.id}-loop.mp4" muted loop playsinline preload="none" aria-hidden="true"></video>`}
      <span class="tag">${w.fmt === "v" ? "9:16" : "16:9"} · ${w.dur}</span>
      <span class="play">${playIcon}</span>
    </button>
    <div class="card-text">
      <span class="kind">${w.kind}</span>
      <h3>${w.title}</h3>
      <p>${w.text}</p>
    </div>`;
  return el;
}
const gridV = document.getElementById("gridV"), gridH = document.getElementById("gridH");
WORK.forEach(w => (w.fmt === "v" ? gridV : gridH).appendChild(card(w)));

// Preview loops play only while on screen
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".thumb video").forEach(v => io.observe(v));
}

// Reel: muted autoplay, live SMPTE timecode, sound toggle
const reel = document.getElementById("reel");
// Phones get a 640px reel (2 MB) instead of the 1280px one (6 MB)
reel.src = window.matchMedia("(max-width: 760px)").matches ? "media/showreel-sm.mp4" : "media/showreel.mp4";
const tc = document.getElementById("tc"), scrub = document.getElementById("scrub");
const pad = n => String(n).padStart(2, "0");
function smpte(t) {
  const f = Math.floor((t % 1) * 25);
  const s = Math.floor(t);
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

// The button shows the reel's current state: "Muted" until sound is turned on
const soundBtn = document.getElementById("soundBtn"), soundLabel = document.getElementById("soundLabel");
const iconMuted = document.getElementById("iconMuted"), iconSound = document.getElementById("iconSound");
const REEL_VOLUME = 0.6; // showreel plays a bit quieter than full volume (1 = 100%)
function setSound(on) {
  reel.volume = REEL_VOLUME;
  reel.muted = !on;
  soundLabel.textContent = on ? "Sound on" : "Muted";
  iconMuted.hidden = on; iconSound.hidden = !on;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.setAttribute("aria-label", on ? "Showreel sound is on. Mute it" : "Showreel is muted. Turn sound on");
}
soundBtn.addEventListener("click", () => {
  if (reel.muted) {
    setSound(true); reel.currentTime = 0; reel.play().catch(() => {});
  } else {
    setSound(false);
  }
});

// Full clip player
const dlg = document.getElementById("player"), pv = document.getElementById("playerVideo");
const pTitle = document.getElementById("playerTitle");
function openClip(id) {
  const w = WORK.find(x => x.id === id);
  setSound(false);
  pv.poster = `media/${id}.jpg`;
  pv.src = `media/${id}.mp4`;
  pTitle.textContent = `${w.kind} · ${w.fmt === "v" ? "9:16" : "16:9"} · ${w.fps}`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  pv.play().catch(() => {});
}
function closeClip() { pv.pause(); pv.removeAttribute("src"); pv.load(); dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
document.querySelectorAll(".thumb").forEach(b => b.addEventListener("click", () => openClip(b.dataset.id)));
document.getElementById("closeBtn").addEventListener("click", closeClip);
dlg.addEventListener("click", e => { if (e.target === dlg) closeClip(); });
dlg.addEventListener("cancel", e => { e.preventDefault(); closeClip(); });

// Time zones
function clocks() {
  const fmt = tz => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date());
  try {
    document.getElementById("tNY").textContent = fmt("America/New_York");
    document.getElementById("tLDN").textContent = fmt("Europe/London");
    document.getElementById("tIN").textContent = fmt("Asia/Kolkata");
  } catch (e) {}
}
clocks(); setInterval(clocks, 30000);

// Copy email
const copyBtn = document.getElementById("copyBtn"), copied = document.getElementById("copied");
copyBtn.addEventListener("click", () => {
  const text = document.getElementById("email").textContent;
  const done = () => { copied.textContent = "Copied"; setTimeout(() => copied.textContent = "", 2500); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(selectEmail);
  } else { selectEmail(); }
});
function selectEmail() {
  const r = document.createRange(); r.selectNodeContents(document.getElementById("email"));
  const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  copied.textContent = "Selected, press Ctrl+C";
}

// Contact form. Requests are sent through Web3Forms to katt.editing@gmail.com.
// Access key from web3forms.com (public by design; it only lets people send to this inbox).
// If it's ever removed, the form offers email instead.
const FORM_KEY = "20b02ff7-afcd-4a4c-a275-ee630797924b";
const MY_EMAIL = "katt.editing@gmail.com";
const form = document.getElementById("cform");
const planSel = document.getElementById("f-plan");
const fStatus = document.getElementById("f-status"), fSend = document.getElementById("f-send");
const fFallback = document.getElementById("f-fallback"), fMailto = document.getElementById("f-mailto");

const customField = document.getElementById("customField"), customBox = document.getElementById("f-custom");
const customCount = document.getElementById("c-custom");
function syncCustom() { customField.hidden = planSel.value !== "custom"; }
planSel.addEventListener("change", () => { syncCustom(); if (!customField.hidden) customBox.focus(); });
customBox.addEventListener("input", () => { customCount.textContent = `${customBox.value.length} / 1000`; });

// Plan and sample buttons pre-select what the client needs
document.querySelectorAll("[data-plan]").forEach(a => a.addEventListener("click", () => {
  planSel.value = a.dataset.plan; syncCustom();
}));

// Everything typed is treated as plain text: it is never inserted into the page as HTML,
// only sent on as text. clean() also trims each field to its limit and strips invisible
// control and text-direction characters that can disguise what a message or link says.
const LIMITS = { name: 100, email: 254, link: 500, custom: 1000, message: 2000 };
function clean(v, max) {
  return v.normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g, "")
    .trim().slice(0, max);
}

const checks = {
  name: v => v.trim() ? "" : "Add your name so I know who to reply to.",
  email: v => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v.trim()) ? "" : "Enter an email address like name@example.com.",
  // Only plain web links: blocks javascript:, data: and other link types that run code
  link: v => !v.trim() || /^https?:\/\/[^\s<>"]+\.[^\s<>"]+$/i.test(v.trim()) ? "" : "Paste the full link, starting with https://",
  custom: v => planSel.value !== "custom" || v.trim().length >= 10 ? "" : "Describe what you need in a sentence or two."
};
function validate() {
  let first = null;
  for (const [name, check] of Object.entries(checks)) {
    const input = form.elements[name], msg = check(input.value);
    const field = input.closest(".field");
    field.toggleAttribute("data-invalid", !!msg);
    input.setAttribute("aria-invalid", String(!!msg));
    document.getElementById("e-" + name).textContent = msg;
    if (msg && !first) first = input;
  }
  if (first) first.focus();
  return !first;
}
Object.keys(checks).forEach(name => form.elements[name].addEventListener("input", e => {
  const field = e.target.closest(".field");
  if (field.hasAttribute("data-invalid") && !checks[name](e.target.value)) {
    field.removeAttribute("data-invalid"); e.target.setAttribute("aria-invalid", "false");
    document.getElementById("e-" + name).textContent = "";
  }
}));

function requestText(d) {
  const custom = d.custom ? `\nRequest: ${d.custom}` : "";
  return `Name: ${d.name}\nEmail: ${d.email}\nNeeds: ${d.plan}${custom}\nLink: ${d.link || "(none)"}\n\n${d.message}`.trim();
}
function showFallback(d) {
  const body = requestText(d);
  fMailto.href = `mailto:${MY_EMAIL}?subject=${encodeURIComponent("Request: " + d.plan)}&body=${encodeURIComponent(body)}`;
  fFallback.hidden = false;
  fStatus.textContent = `The form can't send right now. Your request is ready to email to ${MY_EMAIL} instead.`;
  document.getElementById("f-copymsg").onclick = () => {
    const done = () => { fStatus.textContent = `Copied. Paste it into an email to ${MY_EMAIL}.`; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(body).then(done).catch(() => {});
  };
}
function showSent(d) {
  form.innerHTML = "";
  const box = document.createElement("div");
  box.className = "sent";
  box.innerHTML = "<h3>Request sent</h3><p></p>";
  box.querySelector("p").textContent = `I'll reply to ${d.email} within a day.`;
  form.appendChild(box);
  box.setAttribute("tabindex", "-1"); box.focus();
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (document.getElementById("f-bot").checked) return;
  if (!validate()) return;
  const d = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(form.elements[k].value, max)]));
  const isCustom = planSel.value === "custom";
  d.plan = isCustom ? "Custom request" : planSel.value;
  if (!isCustom) d.custom = "";
  fFallback.hidden = true;
  if (!FORM_KEY) { showFallback(d); return; }
  fSend.disabled = true; fStatus.textContent = "Sending...";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: FORM_KEY, subject: `New request: ${d.plan}`, from_name: "Katt Editing website", ...d })
    });
    const json = await res.json();
    if (json.success) { showSent(d); return; }
    showFallback(d);
  } catch (err) {
    showFallback(d);
  } finally {
    fSend.disabled = false;
  }
});
