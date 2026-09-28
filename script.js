"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const currentYear = document.getElementById("currentYear");
  const printButton = document.getElementById("printButton");
  const backToTopButton = document.getElementById("backToTop");
  const progressBars = document.querySelectorAll(".progress-bar");

  // แสดงปีปัจจุบันใน Footer
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // พิมพ์หรือบันทึกหน้า Resume เป็น PDF
  if (printButton) {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }

  // แสดงปุ่มกลับขึ้นด้านบนเมื่อเลื่อนหน้า
  window.addEventListener("scroll", () => {
    if (!backToTopButton) {
      return;
    }

    if (window.scrollY > 450) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  // กลับขึ้นด้านบน
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // Animation สำหรับระดับภาษา
  progressBars.forEach((bar) => {
    const width = Number(bar.dataset.width) || 0;
    const safeWidth = Math.min(Math.max(width, 0), 100);

    requestAnimationFrame(() => {
      bar.style.width = `${safeWidth}%`;
    });
  });

  // ใช้ไอคอนสำรองเมื่อโหลดโลโก้ไม่ได้
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      if (image.classList.contains("profile-photo")) {
        image.alt = "ไม่สามารถโหลดภาพโปรไฟล์ได้";
        return;
      }

      const parent = image.parentElement;

      if (!parent || parent.querySelector(".fallback-icon")) {
        image.style.display = "none";
        return;
      }

      const fallbackIcon = document.createElement("i");
      fallbackIcon.className = "fa-solid fa-cube fallback-icon";
      fallbackIcon.setAttribute("aria-hidden", "true");

      image.style.display = "none";
      parent.prepend(fallbackIcon);
    });
  });
});
const slideshow = document.getElementById("portfolioSlideshow");

if (slideshow) {
  const slides = Array.from(slideshow.querySelectorAll(".slide"));
  const dots = Array.from(slideshow.querySelectorAll(".slide-dot"));
  const previousButton = slideshow.querySelector(".slide-previous");
  const nextButton = slideshow.querySelector(".slide-next");
  const autoplayButton = slideshow.querySelector(".slide-autoplay");

  const autoplayDelay = 5000;

  let currentSlide = 0;
  let autoplayTimer = null;
  let isPaused = false;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentSlide;

      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;

      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  }

  function showNextSlide() {
    showSlide(currentSlide + 1);
  }

  function showPreviousSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    window.clearInterval(autoplayTimer);

    if (!isPaused && slides.length > 1) {
      autoplayTimer = window.setInterval(
        showNextSlide,
        autoplayDelay
      );
    }
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function updateAutoplayButton() {
    if (!autoplayButton) {
      return;
    }

    const icon = autoplayButton.querySelector("i");

    autoplayButton.setAttribute(
      "aria-pressed",
      String(isPaused)
    );

    autoplayButton.setAttribute(
      "aria-label",
      isPaused
        ? "เริ่มการเลื่อนภาพอัตโนมัติ"
        : "หยุดการเลื่อนภาพอัตโนมัติ"
    );

    if (icon) {
      icon.className = isPaused
        ? "fa-solid fa-play"
        : "fa-solid fa-pause";
    }
  }

  previousButton?.addEventListener("click", () => {
    showPreviousSlide();
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    showNextSlide();
    restartAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetSlide = Number(dot.dataset.slide);

      showSlide(targetSlide);
      restartAutoplay();
    });
  });

  autoplayButton?.addEventListener("click", () => {
    isPaused = !isPaused;
    updateAutoplayButton();

    if (isPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // รองรับปุ่มลูกศรบนแป้นพิมพ์
  slideshow.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPreviousSlide();
      restartAutoplay();
    }

    if (event.key === "ArrowRight") {
      showNextSlide();
      restartAutoplay();
    }
  });

  // หยุดชั่วคราวเมื่อชี้เมาส์หรือโฟกัสอยู่ใน Slideshow
  slideshow.addEventListener("mouseenter", stopAutoplay);
  slideshow.addEventListener("mouseleave", startAutoplay);
  slideshow.addEventListener("focusin", stopAutoplay);
  slideshow.addEventListener("focusout", startAutoplay);

  showSlide(0);
  updateAutoplayButton();
  startAutoplay();
<h1 data-i18n="fullName">บุญถนอม หาญกลาง</h1>

<p class="job-title" data-i18n="jobTitle">
  DevOps Engineer และ System Engineer
</p>

<p class="profile-summary" data-i18n="profileSummary">
  มีประสบการณ์ด้านการบริหาร Cloud Infrastructure, CI/CD,
  Infrastructure as Code, Kubernetes, Monitoring และ Linux Server
</p>

<div class="availability">
  <span class="availability-dot"></span>
  <span data-i18n="availability">
    กำลังมองหาโอกาสงานด้าน DevOps และ Cloud Engineering
  </span>
</div>

}
