/* =========================================================
   Christopher Alberto — Portfolio · main.js
   GSAP + ScrollTrigger + Lenis
   Progressive enhancement: content is visible without JS;
   GSAP.from() reveals it. Counters & filter run vanilla.
   ========================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* -------------------------------------------------- *
   * 1 · Lenis smooth scroll (+ ScrollTrigger sync)
   * -------------------------------------------------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !REDUCED) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
    if (hasGSAP) {
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -10 });
    else { var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  }
  // anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      closeMenu();
    });
  });

  /* -------------------------------------------------- *
   * 2 · Nav state + scroll progress
   * -------------------------------------------------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------- *
   * 3 · Mobile menu (burger)
   * -------------------------------------------------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('nav-links');
  var mobileNavQuery = window.matchMedia('(max-width: 880px)');
  // Below 880px the closed menu is only hidden via transform/pointer-events
  // (for the slide-in transition), so it stays in the tab order unless we
  // also mark it inert — otherwise keyboard users tab into invisible links.
  function syncNavInert() {
    if (!navLinks) return;
    var hidden = mobileNavQuery.matches && !document.body.classList.contains('menu-open');
    if (hidden) navLinks.setAttribute('inert', '');
    else navLinks.removeAttribute('inert');
  }
  mobileNavQuery.addEventListener('change', syncNavInert);
  syncNavInert();
  var menuOpen = false;
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    document.body.classList.remove('menu-open');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    syncNavInert();
  }
  if (burger) {
    burger.addEventListener('click', function () {
      menuOpen = !menuOpen;
      document.body.classList.toggle('menu-open', menuOpen);
      burger.classList.toggle('is-open', menuOpen);
      burger.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
      syncNavInert();
    });
  }

  /* -------------------------------------------------- *
   * 4 · Project filter
   * -------------------------------------------------- */
  var filter = document.getElementById('filter');
  var grid = document.getElementById('grid');
  if (filter && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      filter.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var f = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-stack') === f;
        if (show) {
          card.classList.remove('is-hidden');
          if (hasGSAP && !REDUCED) gsap.fromTo(card, { opacity: 0, y: 18 }, { opacity: 1, y: 0, x: 0, rotation: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform' });
        } else {
          card.classList.add('is-hidden');
        }
      });
      if (hasST) ScrollTrigger.refresh();
    });
  }

  /* -------------------------------------------------- *
   * 5 · Animated counters (vanilla — robust)
   * -------------------------------------------------- */
  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var to = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (REDUCED) { el.textContent = to + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* -------------------------------------------------- *
   * 6 · Marquee — duplicate content for seamless CSS loop
   * -------------------------------------------------- */
  var mq = document.getElementById('marquee');
  if (mq && mq.firstElementChild) {
    mq.appendChild(mq.firstElementChild.cloneNode(true));
  }

  /* -------------------------------------------------- *
   * 7 · Word splitter (preserves <em>, <br>, inner spans)
   * -------------------------------------------------- */
  function splitWords(el) {
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (part === '') return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); }
            else {
              var s = document.createElement('span');
              s.className = 'word';
              s.style.display = 'inline-block';
              s.style.willChange = 'transform, opacity';
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    }
    walk(el);
    return el.querySelectorAll('.word');
  }
  /* -------------------------------------------------- *
   * 7.5 · Terminal Typing Animation
   * -------------------------------------------------- */
  function runTerminalAnimation() {
    var term = document.getElementById('term');
    if (!term) return;

    var rows = Array.prototype.slice.call(term.querySelectorAll('.term__row'));
    
    // Hide all rows initially
    rows.forEach(function (row) {
      row.style.opacity = '0';
    });

    var rowIndex = 0;

    function nextStep() {
      if (rowIndex >= rows.length) return;

      var row = rows[rowIndex];
      var type = row.getAttribute('data-term');

      if (type === 'cmd') {
        row.style.opacity = '1';
        
        var cmdTextEl = row.querySelector('.cmd-text');
        var cursorEl = row.querySelector('.cursor');
        
        if (cmdTextEl) {
          var targetText = cmdTextEl.textContent.trim();
          cmdTextEl.textContent = '';
          if (cursorEl) cursorEl.style.display = 'inline-block';

          var charIndex = 0;
          function typeChar() {
            if (charIndex < targetText.length) {
              cmdTextEl.textContent += targetText.charAt(charIndex);
              charIndex++;
              var delay = 35 + Math.random() * 60; // Human-like typing delay
              setTimeout(typeChar, delay);
            } else {
              setTimeout(function () {
                if (cursorEl) cursorEl.style.display = 'none';
                rowIndex++;
                nextStep();
              }, 400); // pause before running output or next cmd
            }
          }
          setTimeout(typeChar, 300);
        } else {
          row.style.opacity = '1';
          rowIndex++;
          nextStep();
        }
      } else if (type === 'out') {
        row.style.opacity = '1';
        rowIndex++;
        setTimeout(nextStep, 60); // brief typing output pause
      } else if (type === 'final') {
        row.style.opacity = '1';
        var finalCursor = row.querySelector('.cursor');
        if (finalCursor) finalCursor.style.display = 'inline-block';
        rowIndex++;
      } else {
        row.style.opacity = '1';
        rowIndex++;
        nextStep();
      }
    }

    nextStep();
  }

  /* -------------------------------------------------- *
   * 8 · GSAP reveals
   * -------------------------------------------------- */
  if (hasST && !REDUCED) {

    // hero load timeline
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('[data-anim="line"]', { yPercent: 115, duration: 0.9, stagger: 0.08 }, 0.1)
      .from('.hero__avail', { opacity: 0, y: 14, duration: 0.6 }, 0.1)
      .from('.hero__sub', { opacity: 0, y: 18, duration: 0.7 }, 0.5)
      .from('.hero__stats', { opacity: 0, y: 18, duration: 0.7 }, 0.6)
      .from('.hero__cta', { opacity: 0, y: 18, duration: 0.7 }, 0.7)
      .from('.term', { opacity: 0, y: 36, rotateX: 6, duration: 0.9 }, 0.35)
      .add(runTerminalAnimation, 0.85);

    // hero glow parallax
    gsap.to('.hero__glow', {
      yPercent: 30, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // generic fade-ups — replay each time the element re-enters view
    gsap.utils.toArray('[data-anim="fade"]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none none reverse' }
      });
    });

    // word reveals — replay each time the element re-enters view
    gsap.utils.toArray('[data-anim="words"]').forEach(function (el) {
      var words = splitWords(el);
      gsap.from(words, {
        opacity: 0, y: 22, duration: 0.7, ease: 'power3.out', stagger: 0.02,
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'restart none none reverse' }
      });
    });

    // stack cells — replay each time the grid re-enters view
    gsap.from('[data-anim="cell"]', {
      opacity: 0, y: 40, duration: 0.7, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.stack__grid', start: 'top 80%', toggleActions: 'restart none none reverse' }
    });

    // project cards — alternating swoop in from the bottom-left / bottom-right corners.
    // Each row swoops in as it scrolls into view (ScrollTrigger.batch groups the cards
    // entering together), and replays every time the row re-enters the viewport.
    var projCards = gsap.utils.toArray('[data-anim="card"]');
    var cardDir = function (el) { return projCards.indexOf(el) % 2 === 0 ? -1 : 1; }; // -1 = bottom-left, +1 = bottom-right
    var setCardStart = function (els) {
      gsap.set(els, {
        opacity: 0,
        y: 120,
        x: function (i, el) { return cardDir(el) * 180; },
        rotation: function (i, el) { return cardDir(el) * 9; },
        transformOrigin: '50% 130%'
      });
    };
    setCardStart(projCards); // keep hidden until the row scrolls into view
    ScrollTrigger.batch('[data-anim="card"]', {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, x: 0, y: 0, rotation: 0,
          duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: true,
          clearProps: 'transform' // free the inline transform so the :hover lift still works
        });
      },
      onLeaveBack: function (batch) { setCardStart(batch); } // reset so it swoops again on re-entry
    });

    // certs — replay each time the grid re-enters view
    gsap.from('[data-anim="cert"]', {
      opacity: 0, y: 24, duration: 0.5, ease: 'power2.out', stagger: 0.04,
      scrollTrigger: { trigger: '.certs__grid', start: 'top 85%', toggleActions: 'restart none none reverse' }
    });

    /* ---------------------------------------------- *
     * 9 · Pinned horizontal experience (desktop only)
     * ---------------------------------------------- */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 881px)', function () {
      var pin = document.getElementById('expPin');
      var track = document.getElementById('expTrack');
      if (!pin || !track) return;
      var getDist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
      var tween = gsap.to(track, {
        x: function () { return -getDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: function () { return '+=' + getDist(); },
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      // reveal cards as they enter horizontally — replay when the section re-enters view
      gsap.from(track.querySelectorAll('.exp__card'), {
        opacity: 0, y: 40, duration: 0.6, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: pin, start: 'top 70%', toggleActions: 'restart none none reverse' }
      });
      return function () { tween && tween.scrollTrigger && tween.scrollTrigger.kill(); gsap.set(track, { x: 0 }); };
    });

    ScrollTrigger.refresh();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* -------------------------------------------------- *
   * 10 · Failsafe — never leave a reveal stuck hidden
   *    (e.g. if a ScrollTrigger misfires after the pin)
   * -------------------------------------------------- */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        setTimeout(function () {
          var words = el.querySelectorAll('.word');
          var elStuck = parseFloat(getComputedStyle(el).opacity) < 0.99;
          var wordStuck = words.length && parseFloat(getComputedStyle(words[0]).opacity) < 0.99;
          if (!elStuck && !wordStuck) return;
          if (hasGSAP) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
            if (words.length) gsap.to(words, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.01, clearProps: 'transform' });
          } else {
            el.style.opacity = 1; el.style.transform = 'none';
            Array.prototype.forEach.call(words, function (w) { w.style.opacity = 1; w.style.transform = 'none'; });
          }
        }, 1000);
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('[data-anim]').forEach(function (el) { io.observe(el); });
  })();

  /* -------------------------------------------------- *
   * 11 · Contact Form with Turnstile Integration
   * -------------------------------------------------- */
  (function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('form-name');
    var emailInput = document.getElementById('form-email');
    var messageInput = document.getElementById('form-message');
    var submitBtn = document.getElementById('form-submit-btn');
    var successMsg = document.getElementById('form-success');
    var errorMsg = document.getElementById('form-error');
    var errorMsgText = document.getElementById('form-error-msg');

    var nameError = document.getElementById('form-name-error');
    var emailError = document.getElementById('form-email-error');
    var messageError = document.getElementById('form-message-error');
    var turnstileError = document.getElementById('form-turnstile-error');

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Define Turnstile callbacks globally
    window.turnstileCallback = function () {
      if (turnstileError) turnstileError.textContent = '';
    };
    window.turnstileExpiredCallback = function () {
      if (turnstileError) turnstileError.textContent = 'Verification expired. Please check the box again.';
    };
    window.turnstileErrorCallback = function () {
      if (turnstileError) turnstileError.textContent = 'Security check failed. Please refresh the page.';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Reset errors & status
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      turnstileError.textContent = '';
      successMsg.hidden = true;
      errorMsg.hidden = true;

      var isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        isValid = false;
      }

      // Validate Email
      var emailVal = emailInput.value.trim();
      if (!emailVal) {
        emailError.textContent = 'Please enter your email address.';
        isValid = false;
      } else if (!emailRegex.test(emailVal)) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageError.textContent = 'Please enter your message.';
        isValid = false;
      }

      // Validate Turnstile
      var turnstileToken = '';
      if (typeof window.turnstile !== 'undefined') {
        turnstileToken = window.turnstile.getResponse();
      }
      if (!turnstileToken) {
        turnstileError.textContent = 'Please complete the security check.';
        isValid = false;
      }

      if (!isValid) return;

      // Check if endpoint is configured
      var endpoint = form.getAttribute('action') || '';
      if (endpoint === 'YOUR_BACKEND_ENDPOINT_URL' || !endpoint) {
        errorMsg.hidden = false;
        errorMsgText.innerHTML = 'Form endpoint not configured.<br>Please set up your free Cloudflare Worker backend (see instructions) and update the form\'s <code>action</code> attribute.';
        return;
      }

      // Prepare payload
      var payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        'cf-turnstile-response': turnstileToken
      };

      // Set loading state
      submitBtn.disabled = true;
      var originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            throw new Error(data.error || 'Server error: ' + res.status);
          }
          return data;
        }).catch(function (err) {
          if (err instanceof Error) throw err;
          throw new Error('Server returned error code: ' + res.status);
        });
      })
      .then(function () {
        successMsg.hidden = false;
        form.reset();
        if (typeof window.turnstile !== 'undefined') {
          window.turnstile.reset();
        }
      })
      .catch(function (err) {
        errorMsg.hidden = false;
        errorMsgText.textContent = err.message || 'There was an issue sending your message. Please try again.';
        if (typeof window.turnstile !== 'undefined') {
          window.turnstile.reset();
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
    });
  })();

  /* -------------------------------------------------- *
   * 12 · Scroll-spy — active nav link for current section
   * -------------------------------------------------- */
  (function () {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__links a[href^="#"]')
    );
    if (!links.length) return;

    var sections = [];
    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) sections.push({ id: sec.id, el: sec, link: a });
    });
    if (!sections.length) return;

    var current = null;
    function setActive(id) {
      if (id === current) return;
      current = id;
      sections.forEach(function (s) {
        s.link.classList.toggle('is-active', s.id === id);
      });
    }

    function update() {
      var line = window.innerHeight * 0.3; // activation line in the top third
      var bestId = null, bestTop = -Infinity;
      sections.forEach(function (s) {
        var top = s.el.getBoundingClientRect().top;
        // pick the section whose top has most recently passed the line
        if (top <= line && top > bestTop) { bestTop = top; bestId = s.id; }
      });
      setActive(bestId); // null while still above the first section (hero)
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  /* -------------------------------------------------- *
   * 13 · Roaming ambient glow
   *    Fixed to the viewport (so it follows on scroll),
   *    drifting to random positions within view.
   * -------------------------------------------------- */
  (function () {
    var glow = document.getElementById('roamGlow');
    if (!glow) return;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    // Center the blob on its (x, y) transform coordinate.
    if (hasGSAP) gsap.set(glow, { xPercent: -50, yPercent: -50 });

    // Static, gentle placement when motion is reduced or GSAP is unavailable.
    if (REDUCED || !hasGSAP) {
      glow.style.transform = 'translate(-50%,-50%)';
      glow.style.left = '50%';
      glow.style.top = '38%';
      return;
    }

    function move() {
      // Keep the core within the viewport (the blur naturally bleeds past edges).
      var x = rand(window.innerWidth * 0.12, window.innerWidth * 0.88);
      var y = rand(window.innerHeight * 0.18, window.innerHeight * 0.82);
      gsap.to(glow, { x: x, y: y, duration: rand(3.5, 6), ease: 'sine.inOut', onComplete: move });
    }

    gsap.set(glow, { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 });
    move();
  })();

  // expose for debugging
  window.__portfolio = { lenis: lenis, scrollTo: scrollTo };
})();
