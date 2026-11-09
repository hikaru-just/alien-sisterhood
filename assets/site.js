/* Alien Sisterhood — small, dependency-free site script */

/* ---- 1. Contact form: paste a Formspree form ID here to receive messages by email.
        Leave empty and the form opens the visitor's email app instead. ---- */
const FORMSPREE_ID = "xgaazjpy";              // e.g. "xyzabcd" from https://formspree.io/f/xyzabcd
const CONTACT_EMAIL = "hikarujustart@gmail.com";


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

/* lightbox for artwork and zine "look inside" galleries */
const box = document.querySelector(".lightbox");
if (box) {
  const img = box.querySelector("img");
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length;
    img.src = list[idx].src; img.alt = list[idx].alt;
  };
  const open = (items, i) => { list = items; box.toggleAttribute("data-single", items.length < 2); show(i); box.showModal(); };
  document.querySelectorAll(".art-grid button").forEach(b => b.addEventListener("click", () => {
    const btns = [...document.querySelectorAll(".art-grid button:not([hidden])")];
    open(btns.map(x => ({ src: x.dataset.full, alt: x.querySelector("img").alt })), btns.indexOf(b));
  }));
  document.querySelectorAll("[data-gallery]").forEach(b => b.addEventListener("click", () => {
    const t = b.dataset.title || "";
    const names = b.dataset.names ? [b.dataset.names] : ["Cover", "Dedication", "Page 1", "Page 2", "Back cover"];
    open(b.dataset.gallery.split(",").map((src, i) => ({ src, alt: b.dataset.names ? t : `${t}: ${names[i] || "page " + (i + 1)}` })), 0);
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
    if (form.hasAttribute("data-order") && cartApi && !cartApi.count()) {
      note.textContent = "Please add at least one product to your order.";
      document.getElementById("order-zine").focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    if (FORMSPREE_ID) {
      note.textContent = "Sending…";
      try {
        const r = await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
          method: "POST", headers: { Accept: "application/json" }, body: new FormData(form)
        });
        if (!r.ok) throw 0;
        form.reset(); if (form.hasAttribute("data-order") && cartApi) cartApi.clear(); note.textContent = "Thank you! We'll be in touch within 24 hours.";
      } catch { note.textContent = "Something went wrong. Please email " + CONTACT_EMAIL + "."; }
    } else {
      const body = `${d.order ? "Order:\n" + d.order + "\n" : ""}${d.address_line1 ? "Ship to:\n" + [d.address_line1, d.address_line2, [d.city, d.state, d.postal_code].filter(Boolean).join(", "), d.country].filter(Boolean).join("\n") + "\n" : ""}${d.tracking ? "Tracking: " + d.tracking + "\n" : ""}${d.payment ? "Payment: " + d.payment + "\n" : ""}${d.order ? "\n" : ""}${d.message}\n\n— ${d.first_name} ${d.last_name}\n${d.email}${d.newsletter ? "\n(Would like news and updates)" : ""}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent((d._subject || "Website message") + " from " + d.first_name)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Opening your email app…";
    }
  });
});

/* order page: a small cart. Items persist in this browser so "Shop more" keeps them. */
const zineSelect = document.getElementById("order-zine");
let cartApi = null;
if (zineSelect) {
  const form = zineSelect.form;
  const KEY = "as-cart";
  const msg = document.getElementById("order-message");
  const list = document.getElementById("order-items");
  const empty = document.getElementById("order-empty");
  const total = document.getElementById("order-total");
  const covers = document.getElementById("order-covers");
  const field = document.getElementById("order-field");
  const ship = document.getElementById("order-ship");
  const printNote = document.getElementById("order-print-note");
  const subject = form.querySelector('[name="_subject"]');
  const opts = {};
  zineSelect.querySelectorAll("option[value]").forEach(o => { if (o.value && !o.disabled) opts[o.value] = o; });
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} };
  let cart = load().filter(i => opts[i.id]);
  let edited = false;
  msg.addEventListener("input", () => edited = true);
  const info = id => {
    const o = opts[id];
    return { id, o, name: o.textContent, title: o.textContent.replace(/ \((printed zine|art print)[^)]*\)$/, ""),
      price: +o.dataset.price || 0, max: +o.dataset.stock || 1, cover: o.dataset.cover || "",
      physical: !!o.dataset.print };
  };
  const esc = t => t.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let render = () => {
    save(cart);
    const items = cart.map(c => ({ ...info(c.id), qty: c.qty }));
    list.innerHTML = items.map(i => `<li class="review-item">
      ${i.cover ? `<img src="${i.cover}" alt="">` : `<span class="review-ph">✦</span>`}
      <div class="review-name">${esc(i.name)}${i.price ? `<small>$${i.price} each</small>` : ""}</div>
      <label class="review-qty"><span class="sr">Quantity</span><select data-qty="${i.id}">${Array.from({ length: i.max }, (_, n) => `<option${n + 1 === i.qty ? " selected" : ""}>${n + 1}</option>`).join("")}</select></label>
      <button type="button" class="review-remove" data-remove="${i.id}" aria-label="Remove ${esc(i.title)}">×</button></li>`).join("");
    empty.hidden = items.length > 0;
    const sum = items.reduce((t, i) => t + i.price * i.qty, 0);
    const anyPhysical = items.some(i => i.physical);
    total.hidden = !items.length;
    total.innerHTML = `Subtotal <strong>$${sum}</strong>${anyPhysical ? " + shipping" : ""}`;
    covers.innerHTML = items.filter(i => i.cover).slice(0, 6).map((i, n) =>
      `<img src="${i.cover}" alt="" style="--n:${n};--r:${n % 2 ? 4 : -4}deg">`).join("");
    covers.style.setProperty("--count", Math.min(6, items.filter(i => i.cover).length));
    if (ship) { ship.hidden = !anyPhysical; ship.disabled = !anyPhysical; }
    if (printNote) printNote.hidden = !anyPhysical;
    const lines = items.map(i => `${i.qty} × ${i.title}${i.id === "other" ? "" : ` (${i.o.dataset.kind === "art" ? "art print" : i.physical ? "printed zine" : "digital zine"})`}${i.price ? `, $${i.price * i.qty}` : ""}`);
    field.value = lines.join("\n") + (items.length ? `\nSubtotal: $${sum}${anyPhysical ? " + shipping" : ""}` : "");
    if (subject) subject.value = items.length ? `Order inquiry: ${items.reduce((t, i) => t + i.qty, 0)} item(s)` : "Order inquiry";
    if (!edited) msg.value = !items.length ? "" : `Hi Hikaru! I'd like to order:\n${lines.map(l => "- " + l).join("\n")}`;
  };
  const add = id => {
    if (!opts[id]) return;
    const hit = cart.find(c => c.id === id);
    if (hit) hit.qty = Math.min(hit.qty + 1, info(id).max); else cart.push({ id, qty: 1 });
    render();
  };
  zineSelect.addEventListener("change", () => { add(zineSelect.value); zineSelect.value = ""; });
  list.addEventListener("change", e => {
    const id = e.target.dataset.qty; if (!id) return;
    cart.find(c => c.id === id).qty = +e.target.value; render();
  });
  list.addEventListener("click", e => {
    const id = e.target.closest("[data-remove]")?.dataset.remove; if (!id) return;
    cart = cart.filter(c => c.id !== id); render();
  });
  const wanted = new URLSearchParams(location.search).get("zine");
  if (wanted && opts[wanted] && !cart.some(c => c.id === wanted)) cart.push({ id: wanted, qty: 1 });
  if (wanted) history.replaceState(null, "", location.pathname);
  render();
  /* carousel of every product at the bottom of the page */
  const track = document.getElementById("more-track");
  const paintTrack = () => {
    if (!track) return;
    track.querySelectorAll("[data-add]").forEach(btn => {
      const id = btn.dataset.add, i = info(id), hit = cart.find(c => c.id === id);
      const full = hit && hit.qty >= i.max;
      btn.disabled = full;
      btn.textContent = full ? "Added ✓" : hit ? `Add another (${hit.qty})` : "Add to order";
    });
  };
  if (track) {
    track.innerHTML = Object.keys(opts).filter(id => id !== "other" && opts[id].dataset.cover).map(id => {
      const i = info(id);
      const kind = i.o.dataset.kind === "art" ? "Art print" : i.physical ? "Printed zine" : "Digital zine";
      return `<li class="more-card"><button type="button" class="more-img" data-add-img="${id}" aria-label="Add ${esc(i.title)}"><img src="${i.cover}" alt="" loading="lazy"></button>
        <p class="more-kind">${kind}</p><h3 class="more-name">${esc(i.title)}</h3>
        <p class="more-row"><span class="price">$${i.price}</span><button type="button" class="btn small lime" data-add="${id}">Add to order</button></p></li>`;
    }).join("");
    track.addEventListener("click", e => {
      const id = e.target.closest("[data-add],[data-add-img]")?.dataset; if (!id) return;
      const key = id.add || id.addImg; const hit = cart.find(c => c.id === key);
      if (hit && hit.qty >= info(key).max) return;
      add(key);
      document.getElementById("order-review").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
    document.querySelectorAll(".more-arrow").forEach(b => b.addEventListener("click", () =>
      track.scrollBy({ left: +b.dataset.dir * track.clientWidth * .8, behavior: reduce ? "auto" : "smooth" })));
  }
  const _render = render;
  render = () => { _render(); paintTrack(); };
  paintTrack();
  cartApi = { count: () => cart.length, clear: () => { cart = []; edited = false; render(); } };
}

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
