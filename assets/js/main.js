(() => {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  const shade = document.querySelector(".shade");

  const close = () => {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    shade?.classList.remove("is-on");
    document.body.classList.remove("menu-open");
  };

  const open = () => {
    burger.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    shade?.classList.add("is-on");
    document.body.classList.add("menu-open");
  };

  burger?.addEventListener("click", () => {
    burger.getAttribute("aria-expanded") === "true" ? close() : open();
  });
  shade?.addEventListener("click", close);
  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => window.setTimeout(close, 0));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) close();
  });

  document.querySelectorAll("img[data-slot]").forEach((img) => {
    const fail = () => {
      const box = document.createElement("div");
      box.className = "slot";
      box.textContent = img.dataset.slot;
      img.replaceWith(box);
    };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  const mast = document.querySelector(".mast");
  const menuNav = document.querySelector(".menu");
  const currentLink = document.querySelector('.menu a[aria-current="page"]');
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const inkKey = "niagara-mast-ink";

  if (mast && menuNav && currentLink && window.matchMedia("(min-width: 761px)").matches) {
    const ink = document.createElement("span");
    ink.className = "mast-ink";
    ink.setAttribute("aria-hidden", "true");
    mast.appendChild(ink);

    const measure = (link) => {
      const mastBox = mast.getBoundingClientRect();
      const box = link.getBoundingClientRect();
      const width = Math.max(16, Math.min(28, box.width * 0.36));
      const left = box.left - mastBox.left + (box.width - width) / 2;
      return { left, width };
    };

    const place = (link, { snap = false } = {}) => {
      const { left, width } = measure(link);
      ink.classList.toggle("is-snap", snap);
      ink.style.width = `${width}px`;
      ink.style.transform = `translateX(${left}px)`;
      ink.classList.add("is-on");
      if (snap) {
        ink.getBoundingClientRect();
        ink.classList.remove("is-snap");
      }
    };

    const save = (link) => {
      try {
        sessionStorage.setItem(inkKey, JSON.stringify(measure(link)));
      } catch (_) {}
    };

    let fromStored = false;
    try {
      const prev = JSON.parse(sessionStorage.getItem(inkKey) || "null");
      if (prev && Number.isFinite(prev.left) && Number.isFinite(prev.width) && !reduceMotion) {
        ink.classList.add("is-snap");
        ink.style.width = `${prev.width}px`;
        ink.style.transform = `translateX(${prev.left}px)`;
        ink.classList.add("is-on");
        ink.getBoundingClientRect();
        ink.classList.remove("is-snap");
        fromStored = true;
      }
    } catch (_) {}

    requestAnimationFrame(() => {
      place(currentLink, { snap: !fromStored || reduceMotion });
      if (fromStored && !reduceMotion) place(currentLink);
    });

    menuNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("mouseenter", () => place(link));
      link.addEventListener("focus", () => place(link));
      link.addEventListener("click", () => save(link));
    });
    menuNav.addEventListener("mouseleave", () => place(currentLink));
    window.addEventListener("resize", () => place(currentLink, { snap: true }));
  }

  const markReveal = (selector, stagger = false) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add(stagger ? "reveal-stagger" : "reveal");
    });
  };

  // Prefer compact targets — avoid wrapping huge legal pages
  markReveal(".page-banner .shell");
  markReveal(".block > .shell > .lead-line");
  markReveal(".block > .shell > .blurb");
  markReveal(".block.green");
  markReveal(".status-band");
  markReveal(".dining .dining-sub");
  markReveal(".legal-meta");
  markReveal(".legal > h2");
  markReveal(".sidebox");
  markReveal(".contact-grid > *");
  markReveal(".cols-2 > .faq");
  markReveal(".ticker", true);
  markReveal(".mosaic", true);
  markReveal(".dining-menus", true);
  markReveal(".dining-steps", true);
  markReveal(".dining-summary");
  markReveal(".status-flow", true);
  markReveal(".stack > .panel", true);

  const targets = [...document.querySelectorAll(".reveal, .reveal-stagger")];

  if (!targets.length) return;

  if (reduceMotion) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const inView = (el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.92 && rect.bottom > 48;
  };

  const show = (el) => el.classList.add("is-in");

  requestAnimationFrame(() => {
    targets.forEach((el) => {
      if (inView(el)) show(el);
    });
    document.documentElement.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => {
      if (!el.classList.contains("is-in")) observer.observe(el);
    });
  });
})();
