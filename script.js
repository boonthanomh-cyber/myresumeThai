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