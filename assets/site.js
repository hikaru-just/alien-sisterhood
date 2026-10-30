/* Alien Sisterhood — small, dependency-free site script */

/* ---- 1. Contact form: paste a Formspree form ID here to receive messages by email.
        Leave empty and the form opens the visitor's email app instead. ---- */
const FORMSPREE_ID = "xgaazjpy";              // e.g. "xyzabcd" from https://formspree.io/f/xyzabcd
const CONTACT_EMAIL = "hikarujustart@gmail.com";

/* ---- 2. Zine checkout: paste each Stripe payment link (https://buy.stripe.com/...) here.
        Until a link is filled in, that zine's "Buy now" button goes to the contact form. ---- */
const PAY_LINKS = {
  "tmd-vol-2": "",   // Trash Moon Diaries Vol. 2
  "tmd-vol-1": "",   // Trash Moon Diaries Vol. 1
};

const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.4 11.4 6.3 12 0z"/></svg>';
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* mobile menu */
const header = document.querySelector(".site-header");
document.querySelector(".menu-btn")?.addEventListener("click", e => {
  const open = header.classList.toggle("nav-open");
  e.currentTarget.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
});
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => {
  header.classList.remove("nav-open"); document.body.style.overflow = "";
}));

/* twinkling star fields on night sections */
document.querySelectorAll(".stars").forEach(field => {
  const n = +field.dataset.count || 26;
  let html = "";
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100, y = Math.random() * 100;
    if (i % 3) html += `<b style="left:${x}%;top:${y}%"></b>`;
    else html += `<i style="left:${x}%;top:${y}%;--s:${6 + Math.random() * 8}px;--d:${3 + Math.random() * 4}s;--dl:${-Math.random() * 6}s">${SPARK}</i>`;
  }
  field.innerHTML = html;
});

/* curved headline that drifts along its path */
document.querySelectorAll("textPath[data-loop]").forEach(tp => {
  if (reduce) return;
  let off = 0, seg = 0, last = performance.now();
  const step = t => {
    const dt = Math.min((t - last) / 1000, .1); last = t;
    if (!seg) seg = tp.getComputedTextLength() / (+tp.dataset.loop || 3);
    off -= 40 * dt; if (seg && off < -seg) off += seg;
    tp.setAttribute("startOffset", off.toFixed(1));
    requestAnimationFrame(step);
  };
  document.fonts.ready.then(() => requestAnimationFrame(step));
});

/* art strip: duplicate items so the loop is seamless */
document.querySelectorAll(".strip-track").forEach(track => {
  track.innerHTML += track.innerHTML;
  track.querySelectorAll("a").forEach((a, i) => {
    a.style.setProperty("--r", (i % 2 ? 2 : -2) + "deg");
    if (i >= track.children.length / 2) a.setAttribute("aria-hidden", "true"), a.tabIndex = -1;
  });
});

/* filter chips (work page) */
document.querySelectorAll("[data-filter-group]").forEach(group => {
  const target = document.querySelector(group.dataset.filterGroup);
  group.addEventListener("click", e => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    group.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === chip));
    const f = chip.dataset.filter;
    target.querySelectorAll(":scope > [data-kind]").forEach(el => el.hidden = f !== "all" && el.dataset.kind !== f);
  });
});

/* lightbox for artwork */
const box = document.querySelector(".lightbox");
if (box) {
  const img = box.querySelector("img");
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length;
    const b = list[idx]; img.src = b.dataset.full; img.alt = b.querySelector("img").alt;
  };
  document.querySelectorAll(".art-grid button").forEach(b => b.addEventListener("click", () => {
    list = [...document.querySelectorAll(".art-grid button:not([hidden])")];
    show(list.indexOf(b)); box.showModal();
  }));
  box.querySelector(".close").onclick = () => box.close();
  box.querySelector(".prev").onclick = () => show(idx - 1);
  box.querySelector(".next").onclick = () => show(idx + 1);
  box.addEventListener("click", e => { if (e.target === box) box.close(); });
  addEventListener("keydown", e => {
    if (!box.open) return;
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
}

/* contact form */
document.querySelectorAll("form[data-contact]").forEach(form => {
  const note = form.querySelector(".form-note");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (FORMSPREE_ID) {
      note.textContent = "Sending…";
      try {
        const r = await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
          method: "POST", headers: { Accept: "application/json" }, body: new FormData(form)
        });
        if (!r.ok) throw 0;
        form.reset(); note.textContent = "Thank you! We'll be in touch within 24 hours.";
      } catch { note.textContent = "Something went wrong. Please email " + CONTACT_EMAIL + "."; }
    } else {
      const body = `${d.message}\n\n— ${d.first_name} ${d.last_name}\n${d.email}${d.newsletter ? "\n(Would like news and updates)" : ""}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Project inquiry from " + d.first_name)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Opening your email app…";
    }
  });
});

/* zine checkout buttons */
document.querySelectorAll("[data-pay]").forEach(a => {
  const url = PAY_LINKS[a.dataset.pay];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Buy now ↗"; }
  else { a.textContent = "Ask to buy"; }
});

/* newsletter: hand the email to Substack's signup page */
document.querySelectorAll("form[data-subscribe]").forEach(f => f.addEventListener("submit", () => {
  setTimeout(() => { f.reset(); const n = f.parentElement.querySelector(".sub-note"); if (n) n.textContent = "Check the Substack tab to finish signing up."; }, 300);
}));

/* gentle reveal on scroll */
const io = "IntersectionObserver" in window && !reduce
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" })
  : null;
document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
