/* =========================================================
   script.js — Resume / Portfolio | บุญถนอม หาญกลาง
   โครงสร้าง:
     1) ปีปัจจุบันใน footer
     2) ปุ่มบันทึกเป็น PDF
     3) ปุ่มกลับขึ้นด้านบน
     4) แถบระดับภาษา (animate เมื่อเลื่อนถึง)
     5) Portfolio Slideshow
     6) ระบบสลับภาษา ไทย / EN
   ========================================================= */
(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================== 1) ปีปัจจุบัน ===================== */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== 2) บันทึกเป็น PDF ===================== */
  const printBtn = document.getElementById('printButton');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  /* ===================== 3) กลับขึ้นด้านบน ===================== */
  const topBtn = document.getElementById('backToTop');
  if (topBtn) {
    const syncTopBtn = () =>
      topBtn.classList.toggle('is-visible', window.scrollY > 320);

    syncTopBtn();
    window.addEventListener('scroll', syncTopBtn, { passive: true });

    topBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  }

  /* ===================== 4) แถบระดับภาษา ===================== */
  const bars = document.querySelectorAll('.progress-bar[data-width]');
  if (bars.length) {
    const fill = (el) => {
      const w = parseInt(el.dataset.width, 10);
      el.style.width = `${Number.isFinite(w) ? Math.min(Math.max(w, 0), 100) : 0}%`;
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          fill(entry.target);
          observer.unobserve(entry.target);   // ทำครั้งเดียวพอ
        });
      }, { threshold: 0.35 });

      bars.forEach((bar) => io.observe(bar));
    } else {
      bars.forEach(fill);                     // fallback เบราว์เซอร์เก่า
    }
  }

  /* ===================== 5) Portfolio Slideshow ===================== */
  function initSlideshow(root) {
    if (!root) return;                                   // ไม่มี element → ออก

    const slides = Array.from(root.querySelectorAll('.slide'));
    if (!slides.length) return;                          // ไม่มีสไลด์ → ออก

    const dots      = Array.from(root.querySelectorAll('.slide-dot'));
    const prevBtn   = root.querySelector('.slide-previous');
    const nextBtn   = root.querySelector('.slide-next');
    const playBtn   = root.querySelector('.slide-autoplay');
    const indicator = root.querySelector('.slide-indicators');
    const DELAY     = 5500;

    const foundActive = slides.findIndex((s) => s.classList.contains('active'));
    let index  = foundActive >= 0 ? foundActive : 0;
    let timer  = null;
    let paused = prefersReducedMotion();   // เคารพผู้ใช้ที่ปิด animation ไว้

    // มีสไลด์เดียว → ไม่ต้องมีปุ่มควบคุม
    if (slides.length < 2) {
      [prevBtn, nextBtn, playBtn, indicator].forEach((el) => el && el.remove());
    }

    // เขียนเลข "01 / 03" อัตโนมัติ — เพิ่มสไลด์แล้วไม่ต้องแก้ HTML
    const pad = (n) => String(n).padStart(2, '0');
    root.querySelectorAll('.slide-number').forEach((el, i) => {
      el.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
    });

    function render() {
      slides.forEach((slide, i) => {
        const isOn = i === index;
        slide.classList.toggle('active', isOn);
        slide.setAttribute('aria-hidden', String(!isOn));
        // กันไม่ให้ Tab หลุดเข้าไปในสไลด์ที่มองไม่เห็น
        slide.querySelectorAll('a, button').forEach((el) => {
          el.tabIndex = isOn ? 0 : -1;
        });
      });

      dots.forEach((dot, i) => {
        const isOn = i === index;
        dot.classList.toggle('active', isOn);
        dot.setAttribute('aria-current', String(isOn));
      });
    }

    // ใช้ modulo → วนได้ทั้งสองทิศ ไม่มีทางหลุดขอบ array
    const goTo = (n) => { index = (n + slides.length) % slides.length; render(); };
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function start() {
      stop();                                  // เคลียร์ก่อนเสมอ → timer ไม่ซ้อนกัน
      if (!paused) timer = setInterval(next, DELAY);
    }
    const restart = () => { if (!paused) start(); };

    function setPaused(value) {
      paused = value;
      value ? stop() : start();

      if (!playBtn) return;
      playBtn.setAttribute('aria-pressed', String(value));
      playBtn.setAttribute(
        'aria-label',
        value ? 'เล่นการเลื่อนภาพอัตโนมัติ' : 'หยุดการเลื่อนภาพอัตโนมัติ'
      );
      const icon = playBtn.querySelector('i');
      if (icon) icon.className = value ? 'fa-solid fa-play' : 'fa-solid fa-pause';
    }

    // --- ปุ่มควบคุม ---
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
    if (playBtn) playBtn.addEventListener('click', () => setPaused(!paused));
    dots.forEach((dot, i) =>
      dot.addEventListener('click', () => { goTo(i); restart(); })
    );

    // --- หยุดอัตโนมัติเมื่อผู้ใช้กำลังดู/โฟกัส หรือสลับแท็บ ---
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', restart);
    document.addEventListener('visibilitychange', () =>
      document.hidden ? stop() : restart()
    );

    // --- คีย์บอร์ด ---
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); restart(); }
    });

    // --- ปัดนิ้วบนมือถือ ---
    let touchStartX = null;
    root.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    root.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); restart(); }
      touchStartX = null;
    }, { passive: true });

    // --- แจ้งเตือนเมื่อโหลดรูปไม่สำเร็จ แทนที่จะเงียบ ---
    root.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        console.error('[slideshow] โหลดรูปไม่สำเร็จ:', img.getAttribute('src'));
        const parent = img.closest('.slide');
        if (parent) parent.classList.add('img-error');
      });
    });

    render();
    setPaused(paused);
  }

  initSlideshow(document.getElementById('portfolioSlideshow'));

  /* ===================== 6) สลับภาษา ไทย / EN ===================== */
  const translations = {
    th: {
      skipLink: 'ข้ามไปยังเนื้อหาหลัก',
      roleLabel: 'DEVOPS ENGINEER',
      jobTitle: 'DevOps Engineer & System Engineer',
      summary: 'มีประสบการณ์ด้านการจัดการ Cloud Infrastructure, CI/CD, Infrastructure as Code, Kubernetes, Monitoring และ Linux Server พร้อมประสบการณ์ดูแลระบบบน AWS, Microsoft Azure และ Google Cloud',
      availability: 'กำลังมองหาโอกาสงานด้าน DevOps และ Cloud Engineering',
      contactButton: 'ติดต่อฉัน',
      printButton: 'บันทึกเป็น PDF',
      downloadButton: 'ดาวน์โหลด Resume',

      contactHeading: 'ข้อมูลติดต่อ',
      labelEmail: 'อีเมล',
      labelLocation: 'พื้นที่ทำงาน',
      locationValue: 'บางนา, กรุงเทพมหานคร',
      contactNote: 'เบอร์โทรศัพท์และ Line ID อยู่ในไฟล์ Resume ที่ดาวน์โหลดได้ด้านบน',

      skillsHeading: 'ทักษะด้านเทคนิค',
      languageHeading: 'ภาษาอังกฤษ',
      langListening: 'การฟัง',
      langSpeaking: 'การพูด',
      langReading: 'การอ่าน',
      langWriting: 'การเขียน',
      levelIntermediate: 'ปานกลาง',
      levelIntermediate2: 'ปานกลาง',
      levelGood: 'ดี',
      levelGood2: 'ดี',

      experienceHeading: 'ประสบการณ์ทำงาน',
      period1: 'มิ.ย. 2567 – ก.พ. 2568',
      exp1b1: 'สร้างและดูแล CI/CD Pipeline ด้วย Jenkins และ GitLab',
      exp1b2: 'บริหาร Infrastructure as Code ด้วย Terraform และ CloudFormation',
      exp1b3: 'บริหาร Kubernetes Cluster และ Helm Charts',
      exp1b4: 'มอนิเตอร์ระบบด้วย Grafana, Prometheus และ ELK',
      exp1b5: 'ปรับปรุงระบบ Cloud บน AWS, Azure และ GCP',

      period2: 'ม.ค. 2566 – ต.ค. 2566',
      exp2b1: 'มอนิเตอร์และดูแลระบบบน Microsoft Azure Cloud',
      exp2b2: 'ติดตั้งและกำหนดค่า Jenkins, GitLab และ Kubernetes',
      exp2b3: 'ดูแล Amazon RDS และเว็บไซต์ WordPress',
      exp2b4: 'บริหารจัดการ DNS ด้วย AWS Route 53',

      period3: 'มิ.ย. 2563 – ธ.ค. 2564',
      exp3b1: 'มอนิเตอร์ AWS Infrastructure ด้วย CloudWatch',
      exp3b2: 'ติดตามประสิทธิภาพและสถานะระบบด้วย Datadog',
      exp3b3: 'ติดตามและจัดการปัญหาผ่าน Jira Service Management',

      period4: 'พ.ค. 2550 – เม.ย. 2551',
      exp4b1: 'ปฏิบัติงานและดูแลระบบภายใน Data Center',
      exp4b2: 'ดูแลเครื่องแม่ข่าย IBM pSeries และ IBM xSeries',
      exp4b3: 'ใช้ IBM Tivoli สำหรับมอนิเตอร์ระบบ',

      period5: 'ส.ค. 2546 – มี.ค. 2550',
      exp5b1: 'ดูแล SMS Chat Server บน Solaris, JBoss และ MySQL',
      exp5b2: 'เขียนและแก้ไข Shell Script สำหรับระบบงาน',
      exp5b3: 'พัฒนาและแก้ไข JSP สำหรับระบบโหวตและระบบแชท',

      educationHeading: 'การศึกษา',
      degree: 'วิทยาศาสตรบัณฑิต สาขาวิทยาการคอมพิวเตอร์',
      university: 'มหาวิทยาลัยราชภัฏอุบลราชธานี',
      eduMeta: 'สำเร็จการศึกษา พ.ศ. 2544',

      galleryHeading: 'ภาพผลงาน',
      slideTitle1: 'CI/CD Pipeline Automation',
      slideDescription1: 'ระบบ Build, Test และ Deploy อัตโนมัติด้วย Jenkins และ GitLab CI/CD',
      slideTitle2: 'Kubernetes Infrastructure',
      slideDescription2: 'บริหาร Container และ Deployment ด้วย Kubernetes, Docker และ Helm',
      slideTitle3: 'Monitoring & Observability',
      slideDescription3: 'Dashboard สำหรับตรวจสอบระบบด้วย Grafana และ Prometheus',

      projectsHeading: 'Demo Projects',
      project1Desc: 'Dashboard สำหรับแสดง Monitoring Metrics และสถานะระบบ',
      project2Desc: 'เว็บไซต์ตัวอย่างสำหรับแสดงผลงานด้าน Web และ CMS',
      project3Desc: 'เว็บไซต์นี้ Deploy อัตโนมัติด้วย GitHub Actions และ GitHub Pages',
      openSite: 'เปิดเว็บไซต์',
      openSite2: 'เปิดเว็บไซต์',
      openRepo: 'ดู Source Code',

      coursesHeading: 'หลักสูตรและการเรียนรู้ออนไลน์',
      footerText: 'DevOps Engineer Portfolio'
    },

    en: {
      skipLink: 'Skip to main content',
      roleLabel: 'DEVOPS ENGINEER',
      jobTitle: 'DevOps Engineer & System Engineer',
      summary: 'Experienced in cloud infrastructure management, CI/CD, Infrastructure as Code, Kubernetes, monitoring and Linux servers, with hands-on operations across AWS, Microsoft Azure and Google Cloud.',
      availability: 'Open to DevOps and Cloud Engineering opportunities',
      contactButton: 'Contact Me',
      printButton: 'Save as PDF',
      downloadButton: 'Download Resume',

      contactHeading: 'Contact Information',
      labelEmail: 'Email',
      labelLocation: 'Location',
      locationValue: 'Bang Na, Bangkok, Thailand',
      contactNote: 'Phone number and Line ID are included in the downloadable resume above.',

      skillsHeading: 'Technical Skills',
      languageHeading: 'English Proficiency',
      langListening: 'Listening',
      langSpeaking: 'Speaking',
      langReading: 'Reading',
      langWriting: 'Writing',
      levelIntermediate: 'Intermediate',
      levelIntermediate2: 'Intermediate',
      levelGood: 'Good',
      levelGood2: 'Good',

      experienceHeading: 'Professional Experience',
      period1: 'Jun 2024 – Feb 2025',
      exp1b1: 'Built and maintained CI/CD pipelines with Jenkins and GitLab',
      exp1b2: 'Managed Infrastructure as Code using Terraform and CloudFormation',
      exp1b3: 'Operated Kubernetes clusters and Helm charts',
      exp1b4: 'Monitored systems with Grafana, Prometheus and the ELK stack',
      exp1b5: 'Optimised cloud workloads across AWS, Azure and GCP',

      period2: 'Jan 2023 – Oct 2023',
      exp2b1: 'Monitored and maintained workloads on Microsoft Azure Cloud',
      exp2b2: 'Installed and configured Jenkins, GitLab and Kubernetes',
      exp2b3: 'Administered Amazon RDS and WordPress websites',
      exp2b4: 'Managed DNS records with AWS Route 53',

      period3: 'Jun 2020 – Dec 2021',
      exp3b1: 'Monitored AWS infrastructure using CloudWatch',
      exp3b2: 'Tracked system performance and health with Datadog',
      exp3b3: 'Handled incident tracking through Jira Service Management',

      period4: 'May 2007 – Apr 2008',
      exp4b1: 'Operated and maintained systems inside the data centre',
      exp4b2: 'Supported IBM pSeries and IBM xSeries servers',
      exp4b3: 'Used IBM Tivoli for system monitoring',

      period5: 'Aug 2003 – Mar 2007',
      exp5b1: 'Maintained SMS chat servers on Solaris, JBoss and MySQL',
      exp5b2: 'Wrote and maintained shell scripts for production systems',
      exp5b3: 'Developed and maintained JSP for voting and chat platforms',

      educationHeading: 'Education',
      degree: 'Bachelor of Science in Computer Science',
      university: 'Ubon Ratchathani Rajabhat University',
      eduMeta: 'Graduated 2001',

      galleryHeading: 'Portfolio Gallery',
      slideTitle1: 'CI/CD Pipeline Automation',
      slideDescription1: 'Automated build, test and deployment with Jenkins and GitLab CI/CD',
      slideTitle2: 'Kubernetes Infrastructure',
      slideDescription2: 'Container and deployment management with Kubernetes, Docker and Helm',
      slideTitle3: 'Monitoring & Observability',
      slideDescription3: 'System monitoring dashboards built with Grafana and Prometheus',

      projectsHeading: 'Demo Projects',
      project1Desc: 'Dashboard presenting monitoring metrics and system health',
      project2Desc: 'Sample website demonstrating web and CMS capability',
      project3Desc: 'This site is deployed automatically via GitHub Actions and GitHub Pages',
      openSite: 'Visit site',
      openSite2: 'Visit site',
      openRepo: 'View source',

      coursesHeading: 'Courses & Online Learning',
      footerText: 'DevOps Engineer Portfolio'
    }
  };

  const langButtons = document.querySelectorAll('.language-button[data-language]');

  if (langButtons.length) {
    function applyLanguage(lang) {
      const dict = translations[lang] || translations.th;

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const value = dict[el.dataset.i18n];
        if (value != null) el.textContent = value;
      });

      // สำคัญต่อ screen reader, การตัดคำ และ SEO
      document.documentElement.lang = lang;

      langButtons.forEach((btn) => {
        const isOn = btn.dataset.language === lang;
        btn.classList.toggle('active', isOn);
        btn.setAttribute('aria-pressed', String(isOn));
      });

      try { localStorage.setItem('resume-lang', lang); } catch (err) { /* private mode */ }
    }

    langButtons.forEach((btn) =>
      btn.addEventListener('click', () => applyLanguage(btn.dataset.language))
    );

    let saved = 'th';
    try { saved = localStorage.getItem('resume-lang') || 'th'; } catch (err) { /* ignore */ }
    applyLanguage(saved);
  }
})();