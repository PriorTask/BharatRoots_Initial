document.addEventListener("DOMContentLoaded", () => {
  // Initialize both sliders by id
  initVideoSlider("craft-slider");
  initVideoSlider("travel-slider");
});

function initVideoSlider(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;

  const slidesWrap = root.querySelector(".slides");
  const slides = Array.from(root.querySelectorAll(".slide"));
  const prevBtn = root.querySelector(".nav.prev");
  const nextBtn = root.querySelector(".nav.next");
  const thumbs = Array.from(root.querySelectorAll(".thumb"));

  let current = 0;

  function update() {
    // translate slidesWrap so the current slide is visible
    const offset = -current * 100;
    slidesWrap.style.transform = `translateX(${offset}%)`;

    // pause all videos except the current one
    slides.forEach((slide, idx) => {
      const vid = slide.querySelector("video");
      if (!vid) return;
      if (idx === current) {
        // keep it as-is (user can press play)
      } else {
        try {
          vid.pause();
          vid.currentTime = 0;
        } catch (e) {}
      }
    });

    // update thumbnail focus (visual hint)
    thumbs.forEach((t, idx) => {
      if (idx === current) t.style.transform = "scale(1.03)";
      else t.style.transform = "scale(1)";
    });
  }

  // Prev / Next handlers
  prevBtn?.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    update();
  });
  nextBtn?.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    update();
  });

  // Thumbnail clicks
  thumbs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number(btn.getAttribute("data-index"));
      if (!Number.isNaN(index)) {
        current = index;
        update();
      }
    });
  });

  // Keyboard support when in focus
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  // Responsive: ensure slide widths are correct on resize
  window.addEventListener("resize", () => update());

  // initial render
  update();
}
