/* =========================================================
   Groomsmen invite: auth, reveal, confetti
   ========================================================= */

// SHA-256 of the passcode. Default passcode is "dayone". Change it before sharing:
//   terminal:  echo -n 'yourpasscode' | shasum -a 256
//   browser:   getHash('yourpasscode')   (in the dev-tools console)
const TARGET_HASH = "6979ce2825cb3f440f987bbc487d62087c333abb99b56062c561ca557392d960";

const SESSION_KEY = "inner-circle-unlocked";

/* ---------- Hashing ---------- */
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Console helper: getHash('newpasscode') -> prints and returns the hash
window.getHash = async function getHash(pw) {
  const hash = await sha256(String(pw).trim().toLowerCase());
  console.log(`TARGET_HASH for "${pw}":\n${hash}`);
  return hash;
};

/* ---------- Session storage (guarded) ---------- */
function isUnlocked() {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}
function rememberUnlock() {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* private mode: fine */ }
}

/* ---------- Gatekeeper ---------- */
const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("passcode");
const errorEl = document.getElementById("gate-error");
const site = document.getElementById("site");

function unlock({ instant = false } = {}) {
  document.body.classList.remove("is-locked");
  site.setAttribute("aria-hidden", "false");
  if (instant) {
    gate.remove();
  } else {
    gate.classList.add("is-leaving");
    gate.addEventListener("transitionend", () => gate.remove(), { once: true });
    setTimeout(() => gate.isConnected && gate.remove(), 1200); // fallback
  }
}

function rejectAttempt(message) {
  errorEl.textContent = message;
  input.classList.add("is-invalid");
  form.classList.remove("is-shaking");
  void form.offsetWidth; // restart animation
  form.classList.add("is-shaking");
  input.select();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const attempt = input.value.trim().toLowerCase(); // forgiving: case + spaces

  if (!attempt) {
    rejectAttempt("Type the passcode first.");
    return;
  }
  if (!window.crypto || !crypto.subtle) {
    rejectAttempt("This browser can’t check the passcode. Open the link over https.");
    return;
  }

  const hash = await sha256(attempt);
  if (hash === TARGET_HASH) {
    errorEl.textContent = "";
    rememberUnlock();
    unlock();
  } else {
    rejectAttempt("That’s not it. Think harder about that night.");
  }
});

input.addEventListener("input", () => {
  input.classList.remove("is-invalid");
  errorEl.textContent = "";
});

if (isUnlocked()) {
  unlock({ instant: true });
} else {
  input.focus();
}

/* ---------- Icons ---------- */
if (window.lucide) window.lucide.createIcons();

/* ---------- Scroll unroll ---------- */
const scrollEl = document.getElementById("scroll");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scrollEl.classList.add("is-open");
          io.disconnect();
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );
  io.observe(scrollEl.closest(".scroll-stage") || scrollEl);
} else {
  scrollEl.classList.add("is-open");
}

/* ---------- Confetti ---------- */
const PALETTE = ["#c9a24a", "#e2c77f", "#1f7a55", "#ead9b2", "#8e2b2b", "#ffffff"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function celebrate() {
  if (typeof window.confetti !== "function") return;

  if (reduceMotion) {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 }, colors: PALETTE, disableForReducedMotion: false });
    return;
  }

  // Opening volley from the center
  confetti({ particleCount: 160, spread: 100, startVelocity: 55, origin: { y: 0.7 }, colors: PALETTE });

  // Side cannons for ~4 seconds
  const end = Date.now() + 4000;
  (function cannons() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: PALETTE });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: PALETTE });
    if (Date.now() < end) requestAnimationFrame(cannons);
  })();

  // Fireworks bursts across the sky
  let bursts = 0;
  const timer = setInterval(() => {
    confetti({
      particleCount: 70,
      spread: 360,
      startVelocity: 30,
      ticks: 90,
      gravity: 0.8,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.3 },
      colors: PALETTE,
    });
    if (++bursts >= 6) clearInterval(timer);
  }, 550);
}

/* ---------- Acceptance + state lock ---------- */
const choices = document.querySelectorAll("#choices .btn");
const confirmation = document.getElementById("confirmation");

choices.forEach((btn) => {
  btn.addEventListener("click", () => {
    choices.forEach((b) => (b.disabled = true));
    btn.classList.add("is-chosen");
    confirmation.hidden = false;
    celebrate();
  });
});
