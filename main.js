(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =====================================================================
     Nav: scrolled state, mobile toggle, active section
     ===================================================================== */
  const nav = document.getElementById("nav");
  const toggle = nav.querySelector(".nav-toggle");
  const links = [...nav.querySelectorAll(".nav-links a")];

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("section[id]").forEach((s) => sectionObs.observe(s));

  /* =====================================================================
     Reveal on scroll
     ===================================================================== */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    // small stagger for siblings in a grid
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
    revealObs.observe(el);
  });

  /* =====================================================================
     Cursor glow + card spotlight
     ===================================================================== */
  const glow = document.querySelector(".cursor-glow");
  if (window.matchMedia("(hover: hover)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  } else {
    glow.style.display = "none";
  }

  /* =====================================================================
     Book Conqueror screenshot carousel
     ===================================================================== */
  const stage = document.getElementById("shotStage");
  const tabs = [...document.querySelectorAll("#shotTabs button")];
  const shots = [...stage.querySelectorAll("img")];
  const DUR = 4500;
  let shotIdx = 0;
  let shotTimer = null;

  function showShot(i) {
    shotIdx = (i + shots.length) % shots.length;
    shots.forEach((img, k) => {
      img.classList.toggle("on", k === shotIdx);
      if (k === shotIdx) img.loading = "eager";
    });
    tabs.forEach((t, k) => {
      t.classList.remove("on");
      if (k === shotIdx) {
        void t.offsetWidth; // restart progress animation
        t.classList.add("on");
      }
    });
  }

  function startShots() {
    stopShots();
    if (reduceMotion) return;
    shotTimer = setInterval(() => showShot(shotIdx + 1), DUR);
  }
  function stopShots() {
    clearInterval(shotTimer);
  }

  tabs.forEach((t, k) => {
    t.style.setProperty("--dur", DUR + "ms");
    t.addEventListener("click", () => {
      showShot(k);
      startShots();
    });
  });

  const featured = document.getElementById("bookconqueror");
  new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? startShots() : stopShots()));
  }).observe(featured);

  /* =====================================================================
     Hero: Cypher query typing
     ===================================================================== */
  const typed = document.getElementById("typed");
  const QUERY = 'MATCH (y:Person {name:"Yusuf"})-[r*1..2]-(n) RETURN y, r, n';
  if (reduceMotion) {
    typed.textContent = QUERY;
  } else {
    let qi = 0;
    const type = () => {
      typed.textContent = QUERY.slice(0, ++qi);
      if (qi < QUERY.length) setTimeout(type, 28 + Math.random() * 45);
    };
    setTimeout(type, 500);
  }

  /* =====================================================================
     Hero: force-directed graph (no library, just canvas)
     ===================================================================== */
  const LABELS = {
    Person: { color: "#f79767", r: 30 },
    Company: { color: "#57c7e3", r: 21 },
    Tech: { color: "#8dcc93", r: 17 },
    Concept: { color: "#c990c0", r: 24 },
    Project: { color: "#ffc454", r: 20 },
  };

  const NODES = [
    { id: "me", label: "Person", name: "Yusuf", props: { role: "Software Engineer" } },

    { id: "viz", label: "Concept", name: "Graph Viz", props: { love: "∞" } },
    { id: "ana", label: "Concept", name: "Analytics", props: { love: "∞" } },
    { id: "gdb", label: "Concept", name: "Graph DB", props: { love: "∞" } },

    { id: "ga", label: "Company", name: "GraphAware", props: { since: 2022 }, href: "https://graphaware.com/" },
    { id: "hume", label: "Project", name: "Hume", props: { by: "GraphAware" }, href: "https://graphaware.com/products/hume/" },
    { id: "ivis", label: "Company", name: "i-Vis Lab", props: { years: "2019–2022" }, href: "#experience" },
    { id: "bilkent", label: "Company", name: "Bilkent", props: { degrees: "BSc, MSc" }, href: "#education" },

    { id: "neo4j", label: "Tech", name: "Neo4j", props: { certified: true } },
    { id: "cypher", label: "Tech", name: "Cypher", props: { queries: "lots" } },
    { id: "cyto", label: "Tech", name: "Cytoscape.js", props: { extensions: "many" } },
    { id: "ts", label: "Tech", name: "TypeScript", props: {} },
    { id: "vue", label: "Tech", name: "Vue.js", props: {} },
    { id: "angular", label: "Tech", name: "Angular", props: {} },
    { id: "java", label: "Tech", name: "Java", props: { use: "Neo4j procedures" } },
    { id: "tiger", label: "Tech", name: "TigerGraph", props: { hackathons: "1st place" }, href: "#awards" },
    { id: "swift", label: "Tech", name: "macOS", props: {} },

    { id: "bc", label: "Project", name: "Book Conqueror", props: { status: "new!" }, href: "#bookconqueror", big: true },
    { id: "davraz", label: "Project", name: "Davraz", props: { type: "graph viz" }, href: "#p-davraz" },
    { id: "hasap", label: "Project", name: "Hasap", props: { type: "calculator" }, href: "#p-hasap" },
    { id: "contra", label: "Project", name: "Contra Color", props: {}, href: "#p-contra" },
  ];

  const EDGES = [
    ["me", "viz", "LOVES"],
    ["me", "ana", "LOVES"],
    ["me", "gdb", "LOVES"],
    ["me", "ga", "WORKS_AT"],
    ["me", "ivis", "WORKED_AT"],
    ["me", "bilkent", "STUDIED_AT"],
    ["me", "bc", "CREATED"],
    ["me", "davraz", "CREATED"],
    ["me", "hasap", "CREATED"],
    ["me", "contra", "CREATED"],
    ["ga", "hume", "BUILDS"],
    ["hume", "neo4j", "USES"],
    ["hume", "vue", "USES"],
    ["hume", "ts", "USES"],
    ["hume", "ana", "ENABLES"],
    ["hume", "viz", "ENABLES"],
    ["neo4j", "gdb", "IS_A"],
    ["cypher", "neo4j", "QUERIES"],
    ["tiger", "gdb", "IS_A"],
    ["java", "neo4j", "EXTENDS"],
    ["cyto", "viz", "RENDERS"],
    ["ivis", "bilkent", "PART_OF"],
    ["ivis", "cyto", "USES"],
    ["ivis", "angular", "USES"],
    ["ivis", "neo4j", "USES"],
    ["davraz", "cyto", "USES"],
    ["davraz", "viz", "DOES"],
    ["bc", "swift", "RUNS_ON"],
    ["hasap", "ts", "USES"],
    ["me", "tiger", "WON_WITH"],
  ];

  const canvas = document.getElementById("graph");
  const ctx = canvas.getContext("2d");
  const propsEl = document.getElementById("props");
  const legendEl = document.getElementById("legend");

  const byId = new Map();
  const nodes = NODES.map((n) => {
    const node = { ...n, x: 0, y: 0, vx: 0, vy: 0, fixed: false, nbrs: new Set(), born: 0 };
    node.r = LABELS[n.label].r * (n.big ? 1.25 : 1);
    byId.set(n.id, node);
    return node;
  });
  const edges = EDGES.map(([s, t, type]) => {
    const e = { s: byId.get(s), t: byId.get(t), type, phase: Math.random() };
    e.s.nbrs.add(e.t);
    e.t.nbrs.add(e.s);
    return e;
  });

  // ambient "dust" nodes floating behind the graph
  const dust = Array.from({ length: 46 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00025,
    vy: (Math.random() - 0.5) * 0.00025,
    r: Math.random() * 1.6 + 0.5,
  }));

  let W = 0,
    H = 0,
    DPR = 1;
  const hidden = new Set();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const firstTime = W === 0;
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (firstTime) seed();
  }

  function seed() {
    // place nodes on rings around the centre: nice "explosion" on load
    const cx = W / 2,
      cy = H / 2;
    nodes.forEach((n, i) => {
      if (n.id === "me") {
        n.x = cx;
        n.y = cy;
        return;
      }
      const a = (i / nodes.length) * Math.PI * 2;
      const d = 10 + Math.random() * 20;
      n.x = cx + Math.cos(a) * d;
      n.y = cy + Math.sin(a) * d;
      n.born = i * 45; // staggered appearance (ms)
    });
  }

  // scale node radius on small canvases
  const sizeScale = () => Math.max(0.62, Math.min(1, W / 620));

  /* ---------- physics ---------- */
  let alpha = 1;

  function tick() {
    const s = sizeScale();
    const cx = W / 2,
      cy = H / 2;
    const vis = nodes.filter((n) => !hidden.has(n.label));
    const k = Math.sqrt((W * H) / vis.length) * 0.52;

    // repulsion
    for (let i = 0; i < vis.length; i++) {
      const a = vis[i];
      for (let j = i + 1; j < vis.length; j++) {
        const b = vis[j];
        let dx = a.x - b.x,
          dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = 0.5;
        }
        const d = Math.sqrt(d2);
        const minD = (a.r + b.r) * s + 14;
        let f = ((k * k) / d) * 0.012 * alpha;
        if (d < minD) f += (minD - d) * 0.08;
        const fx = (dx / d) * f,
          fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // springs
    edges.forEach((e) => {
      if (hidden.has(e.s.label) || hidden.has(e.t.label)) return;
      const dx = e.t.x - e.s.x,
        dy = e.t.y - e.s.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const len = (e.s.id === "me" || e.t.id === "me" ? 1.15 : 0.85) * k;
      const f = (d - len) * 0.03 * alpha;
      const fx = (dx / d) * f,
        fy = (dy / d) * f;
      e.s.vx += fx;
      e.s.vy += fy;
      e.t.vx -= fx;
      e.t.vy -= fy;
    });

    // gravity + integrate + bounds
    const t = performance.now();
    vis.forEach((n) => {
      n.vx += (cx - n.x) * 0.004 * alpha;
      n.vy += (cy - n.y) * 0.004 * alpha;
      // gentle idle wobble so the graph feels alive
      if (!reduceMotion) {
        n.vx += Math.sin(t / 1400 + n.r * 3.1) * 0.012;
        n.vy += Math.cos(t / 1700 + n.r * 2.3) * 0.012;
      }
      if (n.fixed) {
        n.vx = n.vy = 0;
        return;
      }
      n.vx *= 0.82;
      n.vy *= 0.82;
      n.x += n.vx;
      n.y += n.vy;
      const padY = n.r * s + 8;
      const padX = Math.max(padY, n.name.length * 3.6 * Math.max(s, 0.85) + 6);
      n.x = Math.max(padX, Math.min(W - padX, n.x));
      n.y = Math.max(padY + 24, Math.min(H - padY - 40, n.y));
    });

    alpha = Math.max(0.08, alpha * 0.99);
  }

  /* ---------- interaction ---------- */
  let hover = null;
  let drag = null;
  let dragMoved = false;
  let pointer = { x: -1e4, y: -1e4 };

  function nodeAt(x, y) {
    const s = sizeScale();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (hidden.has(n.label)) continue;
      const dx = n.x - x,
        dy = n.y - y;
      if (dx * dx + dy * dy <= Math.pow(n.r * s + 4, 2)) return n;
    }
    return null;
  }

  function localPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function setProps(n) {
    if (!n) {
      propsEl.innerHTML =
        '<span style="color:var(--faint)">' +
        nodes.filter((x) => !hidden.has(x.label)).length +
        " nodes · " +
        edges.filter((e) => !hidden.has(e.s.label) && !hidden.has(e.t.label)).length +
        " relationships</span>";
      return;
    }
    const color = LABELS[n.label].color;
    const kv = Object.entries({ name: n.name, ...n.props })
      .map(([k, v]) => `${k}: <b>${typeof v === "string" ? '"' + v + '"' : v}</b>`)
      .join(", ");
    propsEl.innerHTML = `(<span style="color:${color}">:${n.label}</span> {${kv}})` +
      (n.href ? ' <span style="color:var(--faint)">· click to open</span>' : "");
  }
  setProps(null);

  canvas.addEventListener("pointerdown", (e) => {
    const p = localPos(e);
    const n = nodeAt(p.x, p.y);
    if (!n) return;
    drag = n;
    dragMoved = false;
    n.fixed = true;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    alpha = Math.max(alpha, 0.5);
    e.preventDefault();
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = localPos(e);
    pointer = p;
    if (drag) {
      if (Math.abs(drag.x - p.x) + Math.abs(drag.y - p.y) > 2) dragMoved = true;
      drag.x = p.x;
      drag.y = p.y;
      alpha = Math.max(alpha, 0.35);
      return;
    }
    const n = nodeAt(p.x, p.y);
    if (n !== hover) {
      hover = n;
      setProps(n);
      canvas.classList.toggle("pointing", !!n);
    }
  });

  const endDrag = (e) => {
    if (!drag) return;
    const n = drag;
    n.fixed = false;
    drag = null;
    canvas.classList.remove("dragging");
    if (!dragMoved && n.href) {
      if (n.href.startsWith("#")) {
        document.querySelector(n.href)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        window.open(n.href, "_blank", "noopener");
      }
    }
    // on touch, a tap shows the node's properties
    if (!dragMoved && e.pointerType !== "mouse") {
      hover = n;
      setProps(n);
    }
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", () => {
    if (drag) return;
    hover = null;
    pointer = { x: -1e4, y: -1e4 };
    setProps(null);
    canvas.classList.remove("pointing");
  });

  /* ---------- legend (toggle labels) ---------- */
  Object.entries(LABELS).forEach(([label, { color }]) => {
    const count = nodes.filter((n) => n.label === label).length;
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<i style="background:${color}"></i>${label} <span style="color:var(--faint)">${count}</span>`;
    b.title = "Show/hide " + label + " nodes";
    if (label === "Person") b.disabled = true;
    b.addEventListener("click", () => {
      if (hidden.has(label)) hidden.delete(label);
      else hidden.add(label);
      b.classList.toggle("off", hidden.has(label));
      alpha = 0.8;
      setProps(hover && !hidden.has(hover.label) ? hover : null);
    });
    legendEl.appendChild(b);
  });

  /* ---------- drawing ---------- */
  const start = performance.now();

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function draw(now) {
    const s = sizeScale();
    const elapsed = now - start;
    ctx.clearRect(0, 0, W, H);

    // dust + proximity web
    ctx.fillStyle = "rgba(180,190,255,0.35)";
    dust.forEach((d) => {
      if (!reduceMotion) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.lineWidth = 0.6;
    for (let i = 0; i < dust.length; i++) {
      for (let j = i + 1; j < dust.length; j++) {
        const dx = (dust[i].x - dust[j].x) * W,
          dy = (dust[i].y - dust[j].y) * H;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 70) {
          ctx.strokeStyle = `rgba(160,170,255,${0.12 * (1 - d / 70)})`;
          ctx.beginPath();
          ctx.moveTo(dust[i].x * W, dust[i].y * H);
          ctx.lineTo(dust[j].x * W, dust[j].y * H);
          ctx.stroke();
        }
      }
    }

    const focus = drag || hover;
    const isLit = (n) => !focus || n === focus || focus.nbrs.has(n);
    const visible = (n) => !hidden.has(n.label) && elapsed > n.born;
    const appear = (n) => Math.min(1, Math.max(0, (elapsed - n.born) / 500));

    // edges
    edges.forEach((e) => {
      if (!visible(e.s) || !visible(e.t)) return;
      const lit = focus && (e.s === focus || e.t === focus);
      const dim = focus && !lit;
      const a = Math.min(appear(e.s), appear(e.t));
      const dx = e.t.x - e.s.x,
        dy = e.t.y - e.s.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      const x1 = e.s.x + ux * e.s.r * s,
        y1 = e.s.y + uy * e.s.r * s;
      const x2 = e.t.x - ux * (e.t.r * s + 3),
        y2 = e.t.y - uy * (e.t.r * s + 3);

      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      const ca = LABELS[e.s.label].color,
        cb = LABELS[e.t.label].color;
      const op = (dim ? 0.06 : lit ? 0.85 : 0.28) * a;
      g.addColorStop(0, hexA(ca, op));
      g.addColorStop(1, hexA(cb, op));
      ctx.strokeStyle = g;
      ctx.lineWidth = lit ? 2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // arrow head
      if (!dim) {
        const ah = 6;
        ctx.fillStyle = hexA(cb, op);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - ux * ah - uy * ah * 0.55, y2 - uy * ah + ux * ah * 0.55);
        ctx.lineTo(x2 - ux * ah + uy * ah * 0.55, y2 - uy * ah - ux * ah * 0.55);
        ctx.closePath();
        ctx.fill();
      }

      // particle flowing along the relationship
      if (!dim && !reduceMotion) {
        e.phase = (e.phase + (lit ? 0.012 : 0.005)) % 1;
        const px = x1 + (x2 - x1) * e.phase,
          py = y1 + (y2 - y1) * e.phase;
        ctx.save();
        ctx.shadowColor = cb;
        ctx.shadowBlur = 10;
        ctx.fillStyle = hexA("#ffffff", (lit ? 0.95 : 0.55) * a);
        ctx.beginPath();
        ctx.arc(px, py, lit ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // relationship type label on focus
      if (lit) {
        const mx = (x1 + x2) / 2,
          my = (y1 + y2) / 2;
        let ang = Math.atan2(dy, dx);
        if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(ang);
        ctx.font = "500 9.5px 'JetBrains Mono', monospace";
        const tw = ctx.measureText(e.type).width;
        ctx.fillStyle = "rgba(10,11,22,0.9)";
        ctx.fillRect(-tw / 2 - 4, -7, tw + 8, 14);
        ctx.fillStyle = "#e9ebf5";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.type, 0, 0.5);
        ctx.restore();
      }
    });

    // nodes
    nodes.forEach((n) => {
      if (!visible(n)) return;
      const a = appear(n);
      const lit = isLit(n);
      const { color } = LABELS[n.label];
      const near = Math.hypot(pointer.x - n.x, pointer.y - n.y);
      const hoverBoost = n === focus ? 1.12 : 1;
      const pulse = n.id === "me" || n.id === "bc" ? 1 + Math.sin(now / 600) * 0.035 : 1;
      const r = n.r * s * hoverBoost * pulse * (0.4 + 0.6 * easeOutBack(a));

      ctx.save();
      ctx.globalAlpha = (lit ? 1 : 0.18) * a;

      // halo
      if (lit) {
        const haloR = r * (n === focus ? 2.6 : near < 120 ? 2.1 : 1.8);
        const hg = ctx.createRadialGradient(n.x, n.y, r * 0.6, n.x, n.y, haloR);
        hg.addColorStop(0, hexA(color, n === focus ? 0.45 : 0.22));
        hg.addColorStop(1, hexA(color, 0));
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
        ctx.fill();
      }

      // body with a glossy highlight
      const bg = ctx.createRadialGradient(n.x - r * 0.35, n.y - r * 0.4, r * 0.1, n.x, n.y, r);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(0.18, color);
      bg.addColorStop(1, hexA(color, 0.75));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = n === focus ? 3 : 1.5;
      ctx.strokeStyle = n === focus ? "#ffffff" : "rgba(255,255,255,0.35)";
      ctx.stroke();

      // spinning ring on the newest project
      if (n.id === "bc") {
        ctx.strokeStyle = hexA(color, 0.9);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -now / 60;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // label
      const fs = Math.max(9.5, Math.round((n.label === "Person" ? 13 : 11) * s + 1));
      ctx.font = `600 ${fs}px 'Space Grotesk', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const inside = ctx.measureText(n.name).width < r * 1.8;
      if (inside) {
        ctx.fillStyle = "#14141c";
        ctx.fillText(n.name, n.x, n.y + 0.5);
      } else {
        ctx.fillStyle = "rgba(233,235,245,0.92)";
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 6;
        ctx.fillText(n.name, n.x, n.y + r + fs * 0.9);
      }
      ctx.restore();
    });
  }

  function easeOutBack(t) {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /* ---------- loop (paused when off-screen) ---------- */
  let running = false;
  let raf = 0;
  function frame(now) {
    tick();
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  if (reduceMotion) {
    // settle the layout up-front, then draw a static frame
    nodes.forEach((n) => (n.born = 0));
    for (let i = 0; i < 400; i++) tick();
  }

  new ResizeObserver(() => {
    resize();
    alpha = Math.max(alpha, 0.4);
    if (!running) draw(performance.now() + 1e5);
  }).observe(canvas);

  let inView = false;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      inView = e.isIntersecting;
      inView && !document.hidden ? play() : pause();
    });
  }).observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else if (inView) play();
  });

  /* footer year */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
