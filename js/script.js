document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Custom Ayera cursor ---------- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (finePointer.matches) {
    const cursorDot = document.createElement("div");
    const cursorRing = document.createElement("div");
    cursorDot.className = "ay-custom-cursor";
    cursorRing.className = "ay-custom-cursor-ring";
    cursorDot.setAttribute("aria-hidden", "true");
    cursorRing.setAttribute("aria-hidden", "true");
    document.body.append(cursorRing, cursorDot);
    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let frame = null;

    const move = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${document.documentElement.classList.contains("cursor-hover") ? .7 : 1})`;
      document.documentElement.classList.add("cursor-ready");
      document.documentElement.classList.remove("cursor-hidden");
    };

    const animateRing = () => {
      const ease = reducedMotion.matches ? 1 : 0.16;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${document.documentElement.classList.contains("cursor-hover") ? 1.02 : 1})`;
      frame = window.requestAnimationFrame(animateRing);
    };

    const setHover = (active, image = false) => {
      document.documentElement.classList.toggle("cursor-hover", active);
      document.documentElement.classList.toggle("cursor-image", image && active);
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", () => document.documentElement.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => document.documentElement.classList.remove("cursor-hidden"));

    document.querySelectorAll("a, button, input, textarea, select, label, [role=button]").forEach((el) => {
      el.addEventListener("mouseenter", () => setHover(true));
      el.addEventListener("mouseleave", () => setHover(false));
    });

    document.querySelectorAll("img, video, .project-card, .service-card").forEach((el) => {
      el.addEventListener("mouseenter", () => setHover(true, true));
      el.addEventListener("mouseleave", () => setHover(false));
    });

    animateRing();
    window.addEventListener("beforeunload", () => {
      if (frame) window.cancelAnimationFrame(frame);
    }, { once: true });
  }
  const body = document.body;
  const header = document.querySelector("header[data-no-reveal]");
  const overlay = header?.nextElementSibling?.matches(".fixed.inset-0") ? header.nextElementSibling : null;
  const openBtn = header?.querySelector('button[aria-label="Open menu"]');
  const closeBtn = overlay?.querySelector('button[aria-label="Close menu"]');

  /* ---------- Mobile / full-screen menu ---------- */
  const openMenu = () => {
    if (!overlay) return;
    overlay.classList.remove("translate-x-full");
    overlay.classList.add("translate-x-0", "menu-is-open");
    overlay.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");
    openBtn?.setAttribute("aria-expanded", "true");
    closeBtn?.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!overlay) return;
    overlay.classList.remove("translate-x-0", "menu-is-open");
    overlay.classList.add("translate-x-full");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
    openBtn?.setAttribute("aria-expanded", "false");
  };

  openBtn?.setAttribute("aria-expanded", "false");
  openBtn?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  /* ---------- Header scroll behavior ---------- */
  const updateHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 30;
    header.classList.toggle("site-header-scrolled", scrolled);
    header.classList.toggle("site-header-top", !scrolled);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Smooth in-page scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealTargets = [];
  document.querySelectorAll("section:not(#home), footer").forEach((section) => {
    if (section.hasAttribute("data-no-reveal")) return;
    const children = [...section.children].filter((el) => !el.hasAttribute("data-no-reveal"));
    children.forEach((el, index) => {
      el.classList.add("scroll-reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
      revealTargets.push(el);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Hero slider ---------- */
  const hero = document.querySelector("#home");
  if (hero) {
    const image = hero.querySelector(".ken-burns img");
    const eyebrow = hero.querySelector(".mask-line p.eyebrow");
    const headline = hero.querySelector(".mask-line h1");
    const bodyText = hero.querySelector(".mask-line p.text-paper\\/70");
    const readMore = hero.querySelector(".order-1 a[href=\"#about\"]");
    const progress = hero.querySelector(".slide-progress");
    const slideButtons = [...hero.querySelectorAll('button[aria-label^="Go to slide"]')];
    const prev = hero.querySelector('button[aria-label="Previous slide"]');
    const next = hero.querySelector('button[aria-label="Next slide"]');

    const slides = [
      {
        eyebrow: "Ayera Creative · Kampala, Uganda",
        headline: "Where brands become forces.",
        body: "We build the strategy, creativity and digital experiences that help ambitious businesses become more visible, more relevant and harder to ignore.",
        image: "assets/studio-workshop.jpg",
        alt: "Ayera Creative team presenting brand direction and mood boards in a Kampala studio",
        link: "#about"
      },
      {
        eyebrow: "Websites & Digital Experiences",
        headline: "We build digital experiences that move people.",
        body: "Strategy, intuitive UX, strong visual communication and purposeful technology — from business websites to more complex digital platforms.",
        image: "assets/website-uiux-design.png",
        alt: "Website and digital experience design created by Ayera Creative",
        link: "services.html"
      },
      {
        eyebrow: "Digital Marketing",
        headline: "We turn attention into momentum.",
        body: "Campaigns, content strategy, audience engagement and performance tracking — turning digital activity into purposeful movement.",
        image: "assets/marketing-team.jpg",
        alt: "Ayera Creative marketing team developing a digital campaign",
        link: "services.html"
      }
    ];

    let current = 0;
    let timer = null;
    let touchStartX = null;

    const restartProgress = () => {
      if (!progress) return;
      progress.style.animation = "none";
      void progress.offsetWidth;
      progress.style.animation = "slide-progress 6s linear forwards";
    };

    const animateText = () => {
      [eyebrow, headline, bodyText].forEach((el) => {
        if (!el) return;
        el.classList.remove("hero-copy-in");
        void el.offsetWidth;
        el.classList.add("hero-copy-in");
      });
    };

    const renderSlide = (index) => {
      current = (index + slides.length) % slides.length;
      const slide = slides[current];
      if (!slide) return;

      if (image) {
        image.classList.add("hero-image-out");
        window.setTimeout(() => {
          image.src = slide.image;
          image.alt = slide.alt;
          image.classList.remove("hero-image-out");
          image.classList.remove("hero-image-in");
          void image.offsetWidth;
          image.classList.add("hero-image-in");
        }, 180);
      }
      if (eyebrow) eyebrow.textContent = slide.eyebrow;
      if (headline) headline.textContent = slide.headline;
      if (bodyText) bodyText.textContent = slide.body;
      if (readMore) readMore.href = slide.link;

      slideButtons.forEach((button, i) => {
        const active = i === current;
        button.setAttribute("aria-current", String(active));
        button.classList.toggle("text-orange", active);
        button.classList.toggle("text-paper/40", !active);
      });
      restartProgress();
      animateText();
    };

    const goNext = () => renderSlide(current + 1);
    const goPrev = () => renderSlide(current - 1);
    const startTimer = () => {
      window.clearInterval(timer);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = window.setInterval(goNext, 6000);
      }
    };

    prev?.addEventListener("click", () => { goPrev(); startTimer(); });
    next?.addEventListener("click", () => { goNext(); startTimer(); });
    slideButtons.forEach((button, i) => button.addEventListener("click", () => { renderSlide(i); startTimer(); }));

    hero.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    hero.addEventListener("touchend", (event) => {
      if (touchStartX === null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartX;
      const distance = endX - touchStartX;
      if (Math.abs(distance) > 45) {
        distance < 0 ? goNext() : goPrev();
        startTimer();
      }
      touchStartX = null;
    }, { passive: true });

    renderSlide(0);
    startTimer();
  }

  /* ---------- Diagnostic buttons ---------- */
  document.querySelectorAll('#stuck button[aria-pressed]').forEach((button) => {
    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") === "true";
      document.querySelectorAll('#stuck button[aria-pressed]').forEach((item) => {
        item.setAttribute("aria-pressed", "false");
        item.classList.remove("diagnostic-active");
      });
      button.setAttribute("aria-pressed", String(!active));
      button.classList.toggle("diagnostic-active", !active);
    });
  });

  /* ---------- Static contact form ---------- */
  document.querySelectorAll("form").forEach((form) => {
    const inputs = [...form.querySelectorAll("input:not([type=checkbox]), textarea")];
    const consent = form.querySelector('input[type="checkbox"]');
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!inputs.length || !consent || !submit) return;

    inputs.forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("form-error"));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      inputs.forEach((field) => {
        const value = field.value.trim();
        const emailInvalid = field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const invalid = !value || emailInvalid;
        field.classList.toggle("form-error", invalid);
        if (invalid) valid = false;
      });
      consent.classList.toggle("form-error", !consent.checked);
      if (!consent.checked) valid = false;
      if (!valid) {
        const firstError = form.querySelector(".form-error");
        firstError?.focus();
        return;
      }

      const first = inputs[0]?.value.trim() || "";
      const last = inputs[1]?.value.trim() || "";
      const email = inputs.find((field) => field.type === "email")?.value.trim() || "";
      const message = form.querySelector("textarea")?.value.trim() || "";
      const subject = encodeURIComponent(`Website enquiry from ${first} ${last}`.trim());
      const body = encodeURIComponent(`Name: ${first} ${last}\nEmail: ${email}\n\nMessage:\n${message}`);

      window.location.href = `mailto:ayeracreative@gmail.com?subject=${subject}&body=${body}`;
      let status = form.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        form.appendChild(status);
      }
      status.textContent = "Your email app has been opened with your message ready to send.";
    });
  });

  /* ---------- Back to top ---------- */
  const topBtn = document.querySelector('button[aria-label="Back to top"]');
  const updateTop = () => {
    if (!topBtn) return;
    const show = window.scrollY > 500;
    topBtn.classList.toggle("pointer-events-none", !show);
    topBtn.classList.toggle("translate-y-4", !show);
    topBtn.classList.toggle("opacity-0", !show);
    topBtn.classList.toggle("translate-y-0", show);
    topBtn.classList.toggle("opacity-100", show);
    topBtn.style.backgroundImage = `conic-gradient(var(--orange) ${Math.min(window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1) * 360, 360)}deg, transparent 0deg)`;
  };
  if (topBtn) {
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    updateTop();
    window.addEventListener("scroll", updateTop, { passive: true });
  }
  /* ---------- Premium experience enhancements ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Page transitions between internal pages.
  document.querySelectorAll('a[href$=".html"], a[href^="index.html#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (href.includes('#')) return;
      if (window.location.pathname.endsWith(href)) return;
      if (prefersReduced) return;
      event.preventDefault();
      document.body.classList.add('page-transitioning');
      window.setTimeout(() => { window.location.href = href; }, 520);
    });
  });

  // Give content sections a common story identity and subtle depth on scroll.
  document.querySelectorAll('main > section').forEach((section, index) => {
    if (section.id === 'home') return;
    section.classList.add('story-section');
    section.dataset.storyIndex = String(index);
    const media = section.querySelector('img');
    if (media && !prefersReduced) media.classList.add('parallax-media');
  });

  if ('IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-story-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.story-section').forEach((el) => storyObserver.observe(el));
  }

  // Gentle image parallax tied to scroll position.
  if (!prefersReduced) {
    const parallax = [...document.querySelectorAll('.parallax-media')];
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallax.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -0.035;
        img.style.transform = `translate3d(0, ${Math.max(-14, Math.min(14, offset))}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); } }, { passive:true });
    updateParallax();
  }

  // Services: add a polished interactive state without changing their content.
  document.querySelectorAll('section#services .grid > div, section#services .grid > article, section#services > div > div.grid > div').forEach((card, i) => {
    if (card.querySelector('h3, h2')) {
      card.classList.add('service-interactive');
      const arrow = card.querySelector('svg');
      if (arrow) arrow.classList.add('service-arrow');
      if (!card.querySelector('.service-index')) {
        const marker = document.createElement('span');
        marker.className = 'service-index absolute right-5 top-5 text-xs text-orange/50';
        marker.textContent = String(i + 1).padStart(2,'0');
        card.appendChild(marker);
      }
    }
  });

  // Work: elevate image-containing cards into portfolio interactions.
  document.querySelectorAll('section#work img').forEach((img) => {
    const card = img.closest('a, article, div');
    if (!card || card === document.querySelector('section#work')) return;
    if (img.width || img.naturalWidth) card.classList.add('portfolio-interactive');
  });

  // Team image interactions.
  document.querySelectorAll('section#team img').forEach((img) => img.closest('div')?.classList.add('team-interactive'));

  // Magnetic CTAs: subtle, never more than 10px.
  if (!prefersReduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.btn-label').forEach((el) => {
      if (el.closest('.fixed.inset-0')) return;
      el.classList.add('magnetic');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 10;
        const y = ((e.clientY - r.top) / r.height - .5) * 8;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Upgrade the homepage hero's initial headline to a word/letter reveal.
  const heroHeadline = document.querySelector('#home h1');
  if (heroHeadline && !prefersReduced && !heroHeadline.dataset.typedEnhanced) {
    heroHeadline.dataset.typedEnhanced = 'true';
    const text = heroHeadline.textContent.trim();
    heroHeadline.setAttribute('aria-label', text);
    heroHeadline.innerHTML = '';
    text.split(' ').forEach((word, wi) => {
      const wrap = document.createElement('span');
      wrap.className = 'hero-word';
      [...word].forEach((char, ci) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${220 + wi * 180 + ci * 32}ms`;
        wrap.appendChild(span);
      });
      heroHeadline.appendChild(wrap);
      if (wi < text.split(' ').length - 1) heroHeadline.appendChild(document.createTextNode(' '));
    });
  }

  // Contact: progressive project selection, adapted to every static page form.
  document.querySelectorAll('form.contact-form').forEach((form) => {
    if (form.querySelector('.contact-choice-wrap')) return;
    const choices = ['Branding','Website','Digital Marketing','Social Media','Photo & Video','UI/UX','ICT','Other'];
    const wrapper = document.createElement('div');
    wrapper.className = 'contact-choice-wrap';
    wrapper.innerHTML = '<h3>What can we help you with?</h3><div class="contact-choices"></div>';
    const choiceGrid = wrapper.querySelector('.contact-choices');
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'contact-choice'; btn.textContent = choice;
      btn.addEventListener('click', () => btn.classList.toggle('selected'));
      choiceGrid.appendChild(btn);
    });
    form.insertBefore(wrapper, form.firstChild);
  });

  // Client-logo marquees: duplicate a row where a suitable flex list exists.
  document.querySelectorAll('.marquee-track').forEach((track) => {
    if (track.closest('.client-marquee')) return;
    const items = [...track.children];
    if (items.length < 4) return;
    const parent = track.parentElement;
    parent.classList.add('client-marquee');
    track.classList.add('client-marquee-track');
    items.forEach((item) => track.appendChild(item.cloneNode(true)));
  });

});
