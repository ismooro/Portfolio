/* =================================================================
   Portfolio — Ismaël Fofana
   Script
   Sommaire :
     1. Utilitaires
     2. Année du pied de page
     3. Thème clair / sombre
     4. Navigation mobile
     5. Défilement doux + fermeture du menu au clic
     6. Barre de progression de lecture
     7. Scrollspy (lien actif dans la nav)
     8. Timeline : tracé progressif au scroll
     9. Accordéon des projets
     10. Copier l'adresse e-mail
     11. Canvas hero : réseau de circuits animé
================================================================= */
(function () {
  "use strict";

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = reduceMotionQuery.matches;

  /* ---------- 1. UTILITAIRES ---------- */
  function on(el, ev, fn, opts) {
    if (el) el.addEventListener(ev, fn, opts || false);
  }
  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /* ---------- 2. ANNÉE DU PIED DE PAGE ---------- */
  var footerYear = qs("#footerYear");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ---------- 3. THÈME CLAIR / SOMBRE ---------- */
  var root = document.documentElement;
  var themeToggle = qs("#themeToggle");
  var THEME_KEY = "if-portfolio-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }
  function storeTheme(v) {
    try {
      localStorage.setItem(THEME_KEY, v);
    } catch (e) {
      /* stockage indisponible : on ignore silencieusement */
    }
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    if (window.heroCircuit) window.heroCircuit.refreshColors();
  }

  /* Le sombre est l'identité visuelle principale du site (canvas circuit compris) ;
     on ne bascule en clair que si la personne le choisit explicitement. */
  var initialTheme = getStoredTheme() || "dark";
  applyTheme(initialTheme);

  on(themeToggle, "click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    storeTheme(next);
  });

  /* ---------- 4. NAVIGATION MOBILE ---------- */
  var navToggle = qs("#navToggle");
  var mainNav = qs("#mainNav");

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openNav() {
    if (!mainNav) return;
    mainNav.classList.add("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  on(navToggle, "click", function () {
    var isOpen = mainNav.classList.contains("is-open");
    if (isOpen) closeNav();
    else openNav();
  });

  /* ---------- 5. DÉFILEMENT DOUX + FERMETURE DU MENU ---------- */
  qsa('a[href^="#"]').forEach(function (link) {
    on(link, "click", function () {
      closeNav();
    });
  });

  /* ---------- 6. BARRE DE PROGRESSION DE LECTURE ---------- */
  var progressFill = qs("#scrollProgressFill");
  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = doc.scrollHeight - doc.clientHeight;
    var ratio = scrollHeight > 0 ? clamp(scrollTop / scrollHeight, 0, 1) : 0;
    if (progressFill) progressFill.style.width = (ratio * 100).toFixed(2) + "%";
    updateTimelineFill();
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }
  on(window, "scroll", requestTick, { passive: true });
  on(window, "resize", requestTick);

  /* ---------- 7. SCROLLSPY ---------- */
  var navLinks = qsa(".nav-link");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? qs(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = "#" + entry.target.id;
          var link = navLinks.filter(function (l) {
            return l.getAttribute("href") === id;
          })[0];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- 8. TIMELINE : TRACÉ PROGRESSIF ---------- */
  var timeline = qs("#timeline");
  var timelineFill = qs("#timelineFill");

  function updateTimelineFill() {
    if (!timeline || !timelineFill) return;
    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var start = vh * 0.8;
    var total = rect.height + vh * 0.4;
    var progressed = clamp(start - rect.top, 0, total);
    var ratio = total > 0 ? progressed / total : 0;
    timelineFill.style.height = (ratio * 100).toFixed(2) + "%";
  }
  updateTimelineFill();

  /* ---------- 9. ACCORDÉON DES PROJETS ---------- */
  qsa(".project-card").forEach(function (card) {
    var head = qs(".project-head", card);
    on(head, "click", function () {
      var isOpen = card.getAttribute("data-open") === "true";
      card.setAttribute("data-open", isOpen ? "false" : "true");
      head.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  /* ---------- 10. COPIER L'ADRESSE E-MAIL ---------- */
  var copyBtn = qs("#copyEmailBtn");
  on(copyBtn, "click", function () {
    var email = copyBtn.getAttribute("data-email") || "";
    var done = function () {
      copyBtn.setAttribute("data-copied", "true");
      window.clearTimeout(copyBtn._resetTimer);
      copyBtn._resetTimer = window.setTimeout(function () {
        copyBtn.setAttribute("data-copied", "false");
      }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () {
        window.location.href = "mailto:" + email;
      });
    } else {
      window.location.href = "mailto:" + email;
    }
  });

  /* ---------- 11. CANVAS HERO : RÉSEAU DE CIRCUITS ---------- */
  var canvas = qs("#heroCanvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = qs("#hero");
    var width = 0, height = 0, dpr = 1;
    var nodes = [];
    var pulses = [];
    var mouse = { x: null, y: null, active: false };
    var bootStart = null;
    var BOOT_DURATION = 1500;
    var colors = { accent: "#4fd8c4", accent2: "#ffb454", line: "rgba(255,255,255,0.14)" };
    var rafId = null;

    function readColors() {
      var styles = getComputedStyle(root);
      colors.accent = styles.getPropertyValue("--accent").trim() || colors.accent;
      colors.accent2 = styles.getPropertyValue("--accent-2").trim() || colors.accent2;
      colors.line = root.getAttribute("data-theme") === "light"
        ? "rgba(16,24,32,0.16)"
        : "rgba(255,255,255,0.14)";
    }

    function hexToRgb(hex) {
      var m = hex.replace("#", "");
      if (m.length === 3) {
        m = m.split("").map(function (c) { return c + c; }).join("");
      }
      var num = parseInt(m, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      nodes = [];
      var area = width * height;
      var count = clamp(Math.round(area / 26000), 26, 70);
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() * 1.6 + 1.1,
          reveal: Math.random()
        });
      }
      pulses = [];
      var linkThreshold = clamp(width / 7, 90, 190);
      var pairs = [];
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkThreshold) pairs.push({ a: a, b: b, d: d });
        }
      }
      var pulseCount = clamp(Math.round(pairs.length / 14), 3, 10);
      for (var p = 0; p < pulseCount && pairs.length; p++) {
        var idx = Math.floor(Math.random() * pairs.length);
        pulses.push({
          a: pairs[idx].a,
          b: pairs[idx].b,
          t: Math.random(),
          speed: 0.0026 + Math.random() * 0.0032,
          warm: Math.random() > 0.5
        });
      }
      linksCache = pairs;
    }

    var linksCache = [];

    function draw(now) {
      if (bootStart === null) bootStart = now;
      var bootT = prefersReducedMotion ? 1 : clamp((now - bootStart) / BOOT_DURATION, 0, 1);

      ctx.clearRect(0, 0, width, height);

      var accRGB = hexToRgb(colors.accent);
      var acc2RGB = hexToRgb(colors.accent2);

      /* liaisons */
      ctx.lineWidth = 1;
      for (var i = 0; i < linksCache.length; i++) {
        var link = linksCache[i];
        var na = nodes[link.a], nb = nodes[link.b];
        if (!na || !nb) continue;
        var appear = clamp((bootT * 1.4) - (link.d / (width + 200)), 0, 1);
        if (appear <= 0) continue;
        ctx.strokeStyle = colors.line;
        ctx.globalAlpha = appear * 0.55;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      /* impulsions de signal */
      if (!prefersReducedMotion) {
        for (var p = 0; p < pulses.length; p++) {
          var pulse = pulses[p];
          var na2 = nodes[pulse.a], nb2 = nodes[pulse.b];
          if (!na2 || !nb2) continue;
          pulse.t += pulse.speed;
          if (pulse.t > 1) {
            pulse.t = 0;
            if (linksCache.length) {
              var np = linksCache[Math.floor(Math.random() * linksCache.length)];
              pulse.a = np.a;
              pulse.b = np.b;
              pulse.warm = Math.random() > 0.5;
            }
          }
          var px = na2.x + (nb2.x - na2.x) * pulse.t;
          var py = na2.y + (nb2.y - na2.y) * pulse.t;
          var col = pulse.warm ? acc2RGB : accRGB;
          var grad = ctx.createRadialGradient(px, py, 0, px, py, 7);
          grad.addColorStop(0, "rgba(" + col.r + "," + col.g + "," + col.b + ",0.95)");
          grad.addColorStop(1, "rgba(" + col.r + "," + col.g + "," + col.b + ",0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* nœuds */
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;

          if (mouse.active) {
            var mdx = node.x - mouse.x;
            var mdy = node.y - mouse.y;
            var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            var influence = 130;
            if (mdist < influence) {
              var force = (1 - mdist / influence) * 0.6;
              node.x += (mdx / (mdist || 1)) * force;
              node.y += (mdy / (mdist || 1)) * force;
            }
          }
        }
        var nodeAppear = clamp(bootT * 1.6 - node.reveal, 0, 1);
        ctx.globalAlpha = nodeAppear * 0.6;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    }

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onPointerLeave() {
      mouse.active = false;
    }

    window.heroCircuit = {
      refreshColors: function () {
        readColors();
        if (prefersReducedMotion) window.requestAnimationFrame(draw);
      }
    };

    readColors();
    resize();
    window.requestAnimationFrame(draw);

    on(window, "resize", resize);
    on(hero, "pointermove", onPointerMove, { passive: true });
    on(hero, "pointerleave", onPointerLeave);

    on(reduceMotionQuery, "change", function (e) {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion && rafId) {
        window.cancelAnimationFrame(rafId);
        draw(performance.now());
      } else {
        bootStart = null;
        window.requestAnimationFrame(draw);
      }
    });
  }
})();
