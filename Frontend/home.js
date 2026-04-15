const navbarToggle = document.querySelector(".navbar-toggle");
const navbarMenu = document.querySelector(".navbar-menu");

if (navbarToggle) {
  navbarToggle.addEventListener("click", () => {
    navbarToggle.classList.toggle("active");
    navbarMenu.classList.toggle("active");
  });
}

// --- VIDEO SLIDER ---
const videoSlides = document.querySelectorAll(".vid_slider .vid_slide");
let videoIndex = 0;

function showVideoSlide(n) {
  videoSlides.forEach((slide, i) => {
    slide.classList.toggle("active", i === n);
  });
}

function nextVideoSlide() {
  videoIndex = (videoIndex + 1) % videoSlides.length;
  showVideoSlide(videoIndex);
}

function prevVideoSlide() {
  videoIndex = (videoIndex - 1 + videoSlides.length) % videoSlides.length;
  showVideoSlide(videoIndex);
}

// Initialize
showVideoSlide(videoIndex);

// Open corresponding link when clicked
function openSlide(index) {
  const links = [
    "https://www.incredibleindia.org/content/incredible-india/en/destinations/mysuru.html",
    "https://www.incredibleindia.org/content/incredible-india/en/destinations/agra.html",
    "https://www.incredibleindia.org/content/incredible-india/en/destinations/kerala.html",
  ];
  window.open(links[index], "_blank");
}

showVideoSlide(videoIndex);

// --- IMAGE SLIDER ---
const imgSlides = document.querySelectorAll(".img_slider .slide");
let imgIndex = 0;

function showImgSlide(n) {
  imgSlides.forEach((slide, i) => {
    slide.style.display = i === n ? "flex" : "none";
  });
}

function nextImgSlide() {
  imgIndex = (imgIndex + 1) % imgSlides.length;
  showImgSlide(imgIndex);
}

function prevImgSlide() {
  imgIndex = (imgIndex - 1 + imgSlides.length) % imgSlides.length;
  showImgSlide(imgIndex);
}

showImgSlide(imgIndex);

// --- MULTI IMAGE SLIDER ---
const sliderContent = document.querySelector(".attractions_slider_content");
const slides = document.querySelectorAll(".att_slide");

let currentIndex = 0;
const slidesToShow = 3; // Number of visible slides
const totalSlides = slides.length;

function updateSlider() {
  const slideWidth = slides[0].offsetWidth + 20; // 20px = gap
  sliderContent.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

function nextAttImgSlide() {
  // corrected function name to match HTML onclick
  if (currentIndex < totalSlides - slidesToShow) {
    currentIndex++;
  } else {
    currentIndex = 0; // Loop back to start
  }
  updateSlider();
}

function prevAttImgSlide() {
  // corrected function name to match HTML onclick
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = totalSlides - slidesToShow; // Go to end
  }
  updateSlider();
}

// Removed auto-sliding
// setInterval(nextAttSlide, 4000);

// --- ITINERARIES INFINITE SLIDER ---
const prevBtn = document.querySelector(".slide-btn.prev");
const nextBtn = document.querySelector(".slide-btn.next");
const slider = document.querySelector(".itin_container");

if (prevBtn && nextBtn && slider) {
  const slides = Array.from(slider.querySelectorAll(".itin_slide"));
  const slideGap = 18; // same as CSS gap

  // Clone first and last slides for infinite effect
  slides.forEach((slide) => slide.classList.add("original")); // mark originals
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.classList.add("clone");
  lastClone.classList.add("clone");

  slider.appendChild(firstClone);
  slider.insertBefore(lastClone, slides[0]);

  // Set initial scroll position to first original slide
  const slideWidth = slides[0].offsetWidth + slideGap;
  slider.scrollLeft = slideWidth;

  function scrollNext() {
    slider.scrollBy({ left: slideWidth, behavior: "smooth" });
  }

  function scrollPrev() {
    slider.scrollBy({ left: -slideWidth, behavior: "smooth" });
  }

  slider.addEventListener("scroll", () => {
    if (slider.scrollLeft >= slideWidth * (slides.length + 1)) {
      // Reached first slide
      slider.scrollLeft = slideWidth;
    } else if (slider.scrollLeft <= 0) {
      // Reached last slide
      slider.scrollLeft = slideWidth * slides.length;
    }
  });

  nextBtn.addEventListener("click", scrollNext);
  prevBtn.addEventListener("click", scrollPrev);
}

// --- CRAFTS SLIDER (robust, responsive, waits for images) ---
document.addEventListener("DOMContentLoaded", () => {
  const craftsContainer = document.querySelector(".crafts_container");
  const craftsSlider = document.querySelector(".crafts_slider");
  let craftsSlides = Array.from(document.querySelectorAll(".crafts_slide"));

  if (!craftsContainer || !craftsSlider || craftsSlides.length === 0) return;

  let craftsCurrentIndex = 0;
  let craftsVisibleCount = getVisibleCount();
  const totalCraftsSlides = craftsSlides.length;
  const GAP_PX = 25; // MUST match CSS gap

  // create buttons only if not present
  let craftsPrevBtn = craftsContainer.querySelector(".crafts_prev_btn");
  let craftsNextBtn = craftsContainer.querySelector(".crafts_next_btn");

  if (!craftsPrevBtn) {
    craftsPrevBtn = document.createElement("button");
    craftsPrevBtn.className = "crafts_prev_btn";
    craftsPrevBtn.innerHTML = "&#10094;";
    craftsContainer.appendChild(craftsPrevBtn);
  }

  if (!craftsNextBtn) {
    craftsNextBtn = document.createElement("button");
    craftsNextBtn.className = "crafts_next_btn";
    craftsNextBtn.innerHTML = "&#10095;";
    craftsContainer.appendChild(craftsNextBtn);
  }

  craftsSlider.style.transition = "transform 0.6s ease-in-out";

  // Wait until images load to compute widths correctly
  waitForImagesToLoad(craftsSlider).then(() => {
    // recalc slides NodeList (in case DOM changed)
    craftsSlides = Array.from(document.querySelectorAll(".crafts_slide"));
    updateCraftsSlider();
    updateControls();
  });

  // Event listeners
  craftsNextBtn.addEventListener("click", nextCraftsSlide);
  craftsPrevBtn.addEventListener("click", prevCraftsSlide);
  window.addEventListener("resize", handleResize);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextCraftsSlide();
    if (e.key === "ArrowLeft") prevCraftsSlide();
  });

  // ------------- functions --------------
  function waitForImagesToLoad(container) {
    const imgs = Array.from(container.querySelectorAll("img"));
    const promises = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.addEventListener("load", res);
        img.addEventListener("error", res); // resolve even if broken so slider still works
      });
    });
    // Also wait a tick for layout stabilisation
    return Promise.all(promises).then(
      () => new Promise((r) => setTimeout(r, 20))
    );
  }

  function getSlideWidth() {
    // Use bounding rect of a slide for best accuracy
    const firstSlide = craftsSlides[0];
    if (!firstSlide) return 0;
    const rect = firstSlide.getBoundingClientRect();
    return rect.width;
  }

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function updateCraftsSlider() {
    const slideWidth = Math.round(getSlideWidth());
    // If for some reason slideWidth is 0, bail out gracefully
    if (slideWidth === 0) return;

    // Ensure current index is within bounds
    craftsVisibleCount = getVisibleCount();
    if (craftsCurrentIndex > totalCraftsSlides - craftsVisibleCount) {
      craftsCurrentIndex = Math.max(0, totalCraftsSlides - craftsVisibleCount);
    }

    const offset = craftsCurrentIndex * (slideWidth + GAP_PX);
    craftsSlider.style.transform = `translateX(-${offset}px)`;
    updateControls();
  }

  function nextCraftsSlide() {
    if (totalCraftsSlides <= craftsVisibleCount) {
      craftsCurrentIndex = 0;
      updateCraftsSlider();
      return;
    }
    if (craftsCurrentIndex < totalCraftsSlides - craftsVisibleCount) {
      craftsCurrentIndex++;
    } else {
      // wrap
      craftsCurrentIndex = 0;
    }
    updateCraftsSlider();
  }

  function prevCraftsSlide() {
    if (totalCraftsSlides <= craftsVisibleCount) {
      craftsCurrentIndex = 0;
      updateCraftsSlider();
      return;
    }
    if (craftsCurrentIndex > 0) {
      craftsCurrentIndex--;
    } else {
      craftsCurrentIndex = Math.max(0, totalCraftsSlides - craftsVisibleCount);
    }
    updateCraftsSlider();
  }

  function handleResize() {
    // after resize, images & layout stable -> re-measure
    waitForImagesToLoad(craftsSlider).then(() => {
      craftsVisibleCount = getVisibleCount();
      if (craftsCurrentIndex > totalCraftsSlides - craftsVisibleCount) {
        craftsCurrentIndex = Math.max(
          0,
          totalCraftsSlides - craftsVisibleCount
        );
      }
      updateCraftsSlider();
    });
  }

  function updateControls() {
    if (totalCraftsSlides <= craftsVisibleCount) {
      craftsPrevBtn.disabled = true;
      craftsNextBtn.disabled = true;
      craftsPrevBtn.classList.add("disabled");
      craftsNextBtn.classList.add("disabled");
    } else {
      craftsPrevBtn.disabled = false;
      craftsNextBtn.disabled = false;
      craftsPrevBtn.classList.remove("disabled");
      craftsNextBtn.classList.remove("disabled");
    }
  }
});
