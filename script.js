/* ================================================================
   KHOAN CẮT BÊ TÔNG PRO - script.js
   All animations, interactions, and dynamic behavior
   ================================================================ */

'use strict';

// ================================================================
// 1. INTRO LOADING SCREEN
// ================================================================
(function initIntro() {
  const screen   = document.getElementById('introScreen');
  const fill     = document.getElementById('progressFill');
  const percent  = document.getElementById('progressPercent');
  const sparks   = document.getElementById('introSparks');

  // Spawn sparks during intro
  function spawnSpark() {
    const s = document.createElement('div');
    s.className = 'intro-spark';
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const angle = Math.random() * Math.PI * 2;
    const dist  = 50 + Math.random() * 120;
    const dur   = (0.5 + Math.random() * 1.2).toFixed(2);
    s.style.cssText = `
      left:${x}%; top:${y}%;
      --dx:${Math.cos(angle) * dist}px;
      --dy:${Math.sin(angle) * dist}px;
      --dur:${dur}s;
      width:${2 + Math.random() * 3}px;
      height:${2 + Math.random() * 3}px;
    `;
    sparks.appendChild(s);
    setTimeout(() => s.remove(), parseFloat(dur) * 1000);
  }
  const sparkInterval = setInterval(spawnSpark, 80);

  // Animate progress bar
  let prog = 0;
  const progressInterval = setInterval(() => {
    prog += 4 + Math.random() * 4;
    if (prog >= 100) {
      prog = 100;
      clearInterval(progressInterval);
    }
    fill.style.width = prog + '%';
    percent.textContent = Math.floor(prog) + '%';
  }, 40);

  // Dismiss intro after ~1.8s
  setTimeout(() => {
    clearInterval(sparkInterval);
    screen.classList.add('exit');
    setTimeout(() => {
      screen.style.display = 'none';
      document.body.style.overflow = '';
    }, 600);
  }, 1800);

  document.body.style.overflow = 'hidden';
})();


// 2. CUSTOM MAGNETIC CURSOR removed


// ================================================================
// 3. NAVBAR — scroll effect & mobile toggle
// ================================================================
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const menu      = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav-link');

  function onScroll() {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else                      navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const overlay = document.getElementById('menuOverlay');
  function openMenu() {
    menu.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
  function closeMenu() {
    menu.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (toggle) {
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (menu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }
  if (overlay) overlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();


// ================================================================
// 4. HERO PARTICLE CANVAS
// ================================================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = H + Math.random() * 20;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(0.4 + Math.random() * 1.2);
      this.r  = 1 + Math.random() * 2.5;
      this.life = 0;
      this.maxLife = 120 + Math.random() * 180;
      this.hue = Math.random() > 0.7 ? 30 : 20; // orange shades
      this.spark = Math.random() > 0.6;
    }
    update() {
      this.x += this.vx + Math.sin(this.life * 0.05) * 0.3;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const alpha = Math.min(1, (this.life / 30)) * Math.max(0, 1 - (this.life / this.maxLife));
      if (this.spark) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.lineWidth = this.r * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx * 8, this.y + this.vy * 8);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2);
        grad.addColorStop(0, `hsl(${this.hue}, 100%, 70%)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 120; i++) {
      const p = new Particle();
      p.life = Math.random() * p.maxLife;
      p.y = Math.random() * H;
      particles.push(p);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  init();
  loop();
  window.addEventListener('resize', () => { resize(); }, { passive: true });
})();


// ================================================================
// 5. PARALLAX HERO BG
// ================================================================
(function initParallax() {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;

  function onScroll() {
    const scrolled = window.scrollY;
    heroBg.style.transform = `translateY(${scrolled * 0.35}px)`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();


// ================================================================
// 6. INTERSECTION OBSERVER — scroll reveal animations
// ================================================================
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-text');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Trigger hero text immediately after intro
  setTimeout(() => {
    document.querySelectorAll('.hero-section .reveal-text').forEach(el => {
      el.classList.add('visible');
    });
  }, 2000);
})();


// ================================================================
// 7. COUNTER ANIMATION
// ================================================================
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(eased * target).toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('vi-VN');
    }
    requestAnimationFrame(update);
  }

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      statNums.forEach(animateCounter);
      observer.disconnect();
    }
  }, { threshold: 0.4 });

  observer.observe(statsSection);
})();


// ================================================================
// 8. 3D TILT CARDS
// ================================================================
(function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 8;
      const rotY   =  dx * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
})();


// ================================================================
// 9. PROJECT SLIDER
// ================================================================
(function initProjectSlider() {
  const track  = document.getElementById('sliderTrack');
  const slides = track ? track.querySelectorAll('.slide') : [];
  const dotsEl = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!track || slides.length === 0) return;

  let current = 0;
  let autoplay;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides[current].classList.add('active');
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  goTo(0);

  prevBtn && prevBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAutoplay(); });

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }
  startAutoplay();
})();


// ================================================================
// 10. REVIEWS SLIDER
// ================================================================
(function initReviewsSlider() {
  const track   = document.getElementById('reviewsTrack');
  const dotsEl  = document.getElementById('reviewDots');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  if (!track) return;

  const cards = track.querySelectorAll('.review-card');
  let current = 0;
  let autoplay;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'review-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.review-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn && prevBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAuto(); });

  function startAuto() {
    autoplay = setInterval(() => goTo(current + 1), 6000);
  }
  startAuto();
})();


// ================================================================
// 11. CONTACT FORM
// ================================================================
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('formSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Basic validation
    const name  = form.querySelector('#name').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    if (!name || !phone) {
      // Shake animation
      form.style.animation = 'shake 0.5s ease';
      setTimeout(() => form.style.animation = '', 600);
      return;
    }

    // Submit to FormSubmit via AJAX
    submitBtn.innerHTML = '<span class="btn-text">Đang gửi...</span>';
    submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch(form.action || 'https://formsubmit.co/ajax/lecuongg16012006@gmail.com', {
      method: form.method || 'POST',
      body: formData,
      headers: {
          'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        form.style.display = 'none';
        success.classList.add('show');
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            alert(data["errors"].map(error => error["message"]).join(", "));
          } else {
            alert("Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi điện trực tiếp!");
          }
          submitBtn.innerHTML = '<span class="btn-text">Gửi Yêu Cầu Báo Giá</span><span class="btn-shine"></span>';
          submitBtn.disabled = false;
        });
      }
    }).catch(error => {
      alert("Lỗi kết nối mạng. Vui lòng thử lại!");
      submitBtn.innerHTML = '<span class="btn-text">Gửi Yêu Cầu Báo Giá</span><span class="btn-shine"></span>';
      submitBtn.disabled = false;
    });
  });

  // Add shake keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-10px)}
      40%{transform:translateX(10px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
  `;
  document.head.appendChild(style);
})();


// ================================================================
// 12. FLOATING CTA + ZALO — show after scroll
// ================================================================
(function initFloatingCta() {
  const cta  = document.getElementById('floatingCta');
  const zalo = document.getElementById('floatingZalo');

  function onScroll() {
    const show = window.scrollY > 400;
    if (cta)  cta.style.opacity  = show ? '1' : '0';
    if (zalo) zalo.style.opacity = show ? '1' : '0';
  }

  if (cta)  { cta.style.transition  = 'opacity 0.4s ease'; cta.style.opacity  = '0'; }
  if (zalo) { zalo.style.transition = 'opacity 0.4s ease'; zalo.style.opacity = '0'; }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


// ================================================================
// 13. ACTIVE NAV LINK on scroll
// ================================================================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
        });
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.style.color = 'var(--accent)';
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => observer.observe(s));
})();



// ================================================================
// 15. PROCESS STEP STAGGER ANIMATION
// ================================================================
(function initProcessStagger() {
  const steps = document.querySelectorAll('.process-step');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.forEach((step, i) => {
          setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, i * 160);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  steps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(40px)';
    step.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });

  const processSection = document.getElementById('process');
  if (processSection) observer.observe(processSection);
})();


// ================================================================
// 16. PERFORMANCE — Passive scroll listeners already set
//     Preload images in background
// ================================================================
(function preloadImages() {
  const imgs = [
    'images/hero_drilling.png',
    'images/service_cutting.png',
    'images/service_demolition.png',
    'images/service_drilling.png',
    'images/project_highrise.png',
    'images/project_industrial.png',
  ];
  imgs.forEach(src => {
    const img = new Image();
    img.src = src;
  });
})();


// ================================================================
// 17. LENIS SMOOTH SCROLLING
// ================================================================
(function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

// ================================================================
// 18. GSAP ADVANCED SCROLL ANIMATIONS (THE TWIST)
// ================================================================
(function initGSAP() {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // Parallax on hero image
  gsap.to(".hero-bg", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // Stagger cards in services
  gsap.from(".service-card", {
    scrollTrigger: {
      trigger: ".services-grid",
      start: "top 80%",
    },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power4.out"
  });

  // Skew text effect for section titles
  const titles = document.querySelectorAll(".section-title");
  titles.forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
      },
      y: 50,
      rotateX: -45,
      opacity: 0,
      duration: 1,
      ease: "back.out(1.7)"
    });
  });

  // Modern Mobile Menu GSAP Animation removed to prevent conflict with CSS toggle
})();

// ================================================================
// 19. MAGNETIC BUTTONS (For desktop)
// ================================================================
(function initMagneticButtons() {
  // Disable magnetic effect on mobile/touch devices to prevent layout overlap
  if (window.innerWidth <= 768 || window.matchMedia("(pointer: coarse)").matches) return;

  const magnets = document.querySelectorAll(".btn-primary, .nav-cta, .floating-cta-inner");
  magnets.forEach(btn => {
    btn.addEventListener("mousemove", function(e) {
      const position = btn.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.5,
        ease: "power3.out"
      });
    });
    
    btn.addEventListener("mouseleave", function(e) {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
})();

